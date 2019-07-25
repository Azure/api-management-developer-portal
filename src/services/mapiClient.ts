import * as _ from "lodash";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Utils } from "../utils";
import { TtlCache } from "./ttlCache";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod, HttpHeader } from "@paperbits/common/http";
import { MapiError } from "./mapiError";
import { IAuthenticator } from "../authentication/IAuthenticator";
import { Router } from "@paperbits/common/routing";

export interface IHttpBatchResponses {
    responses: IHttpBatchResponse[];
}

export interface IHttpBatchResponse {
    httpStatusCode: number;
    headers: {
        [key: string]: string;
    };
    content: any;
}

export class MapiClient {
    private managementApiUrl: string;
    private managementApiVersion: string;
    private environment: string;
    private initializePromise: Promise<void>;
    private requestCache = new TtlCache();

    constructor(
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
        private readonly settingsProvider: ISettingsProvider,
        private readonly router: Router
    ) {
        this.ensureInitialized();
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initializePromise) {
            this.initializePromise = this.setup();
        }
        else {
            return this.initializePromise;
        }
    }

    private async setup(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        const managementApiUrl = settings["managementApiUrl"];

        if (!managementApiUrl) {
            throw new Error(`Management API URL ("managementApiUrl") setting is missing in configuration file.`);
        }

        this.managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);

        const managementApiVersion = settings["managementApiVersion"];

        if (!managementApiVersion) {
            throw new Error(`Management API version ("managementApiVersion") setting is missing in configuration file.`);
        }

        this.managementApiVersion = managementApiVersion;

        const managementApiAccessToken = settings["managementApiAccessToken"];

        if (managementApiAccessToken) {
            this.authenticator.setAccessToken(managementApiAccessToken);
        }

        const managementApiUserId = settings["managementApiUserId"];

        if (managementApiUserId) {
            this.authenticator.setUser(managementApiUserId);
        }

        this.environment = settings["environment"];
    }

    private async requestInternal<T>(httpRequest: HttpRequest): Promise<T> {
        if (!httpRequest.url) {
            throw new Error("Request URL cannot be empty.");
        }

        await this.ensureInitialized();

        httpRequest.headers = httpRequest.headers || [];

        if (httpRequest.body && !httpRequest.headers.some(x => x.name === "Content-Type")) {
            httpRequest.headers.push({ name: "Content-Type", value: "application/json" });
        }

        if (!httpRequest.headers.some(x => x.name === "Accept")) {
            httpRequest.headers.push({ name: "Accept", value: "*/*" });
        }

        if (typeof (httpRequest.body) === "object") {
            httpRequest.body = JSON.stringify(httpRequest.body);
        }

        httpRequest.url = Utils.addQueryParameter(httpRequest.url, `api-version=${this.managementApiVersion}`);

        const call = () => this.makeRequest<T>(httpRequest);
        const requestKey = this.getRequestKey(httpRequest);

        if (requestKey) {
            return this.requestCache.getOrAddAsync<T>(requestKey, call, 1000);
        }

        return call();
    }

    private getRequestKey(httpRequest: HttpRequest): string {
        if (httpRequest.method !== HttpMethod.get && httpRequest.method !== HttpMethod.head && httpRequest.method !== "OPTIONS") {   // TODO:  HttpMethod.options) {
            return null;
        }

        let key = `${httpRequest.method}:${httpRequest.url}`;

        if (httpRequest.headers) {
            key += ":" + httpRequest.headers.sort().map(k => `${k}=${httpRequest.headers.join(",")}`).join("&");
        }

        return key;
    }

    protected async makeRequest<T>(httpRequest: HttpRequest): Promise<T> {
        const authHeader = httpRequest.headers.find(header => header.name === "Authorization");

        if (!authHeader || !authHeader.value) {
            const authToken = this.authenticator.getAccessToken();

            if (!authToken) {
                console.log("Auth token not found");
            } else {
                httpRequest.headers.push({ name: "Authorization", value: `${authToken}` });
            }
        }

        httpRequest.url = `${this.managementApiUrl}${Utils.ensureLeadingSlash(httpRequest.url)}`;

        let response: HttpResponse<T>;

        try {
            response = await this.httpClient.send<T>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error}`);
        }

        return this.handleResponse<T>(response, httpRequest.url);
    }

    private handleResponse<T>(response: HttpResponse<T>, url: string): T {
        let contentType = "";
        if (response.headers) {
            const authTokenHeader = response.headers.find(header => header.name === "ocp-apim-sas-token");

            if (authTokenHeader && authTokenHeader.value) {
                this.authenticator.setAccessToken(`SharedAccessSignature ${authTokenHeader.value}`);
            }

            const contentTypeHeader = response.headers.find(h => h.name.toLowerCase() === "content-type");
            contentType = contentTypeHeader ? contentTypeHeader.value.toLowerCase() : "";
        }

        const text = response.toText();

        if (response.statusCode >= 200 && response.statusCode < 300) {
            if (_.includes(contentType, "json") && text.length > 0) {
                return JSON.parse(text) as T;
            }
            else {
                return <any>text;
            }
        } else {
            this.handleError(response, url);
        }
    }

    private handleError(errorResponse: HttpResponse<any>, requestedUrl: string): void {
        if (errorResponse.statusCode === 429) {
            throw new MapiError("to_many_logins", "Too many attempts. Please try later.");
        }

        if (errorResponse.statusCode === 401) {
            // this.authenticator.clear();

            const authHeader = errorResponse.headers.find(h => h.name.toLowerCase() === "www-authenticate");

            if (authHeader && authHeader.value.indexOf("Basic") !== -1) {
                if (authHeader.value.indexOf("identity_not_confirmed") !== -1) {
                    throw new MapiError("identity_not_confirmed", "User status is Pending. Please check confirmation email.");
                }
                if (authHeader.value.indexOf("invalid_identity") !== -1) {
                    throw new MapiError("invalid_identity", "Invalid email or password.");
                }
            }

            if (this.environment === "production") {
                this.router.navigateTo("/signin");
                return;
            }

            if (this.environment === "development") {
                console.warn(`Development mode: Please specify "managementApiAccessToken" in configuration file.`);
                return;
            }
        }

        const error = this.createMapiError(errorResponse.statusCode, requestedUrl, () => errorResponse.toObject().error);

        if (error) {
            error.response = errorResponse;
            throw error;
        }

        throw new MapiError("Unhandled", "Unhandled error");
    }

    private createMapiError(statusCode: number, url: string, getError: () => any): any {
        switch (statusCode) {
            case 400:
                return getError();

            case 401:
                this.authenticator.clearAccessToken();
                return new MapiError("Unauthorized", "You're not authorized.");

            case 403:
                return new MapiError("AuthorizationFailed", "You're not authorized to perform this operation.");

            case 404:
                return new MapiError("ResourceNotFound", `Resource not found: ${url}`);

            case 408:
                return new MapiError("RequestTimeout", "Could not complete the request. Please try again later.");

            case 409:
                return getError();

            case 500:
                return new MapiError("ServerError", "Internal server error.");

            default:
                return new MapiError("Unhandled", `Unexpected status code in SMAPI response: ${statusCode}.`);
        }
    }

    public get<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.get,
            url: url,
            headers: headers
        });
    }

    public post<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.post,
            url: url,
            headers: headers,
            body: body
        });
    }

    public patch<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.patch,
            url: url,
            headers: headers,
            body: body
        });
    }

    public put<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.put,
            url: url,
            headers: headers,
            body: body
        });
    }

    public delete<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.delete,
            url: url,
            headers: headers
        });
    }

    public head<T>(url: string, headers?: HttpHeader[]): Promise<T> {
        return this.requestInternal<T>({
            method: HttpMethod.head,
            url: url,
            headers: headers
        });
    }
}