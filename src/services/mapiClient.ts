import * as Constants from "./../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging";
import { Utils } from "../utils";
import { TtlCache } from "./ttlCache";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod, HttpHeader } from "@paperbits/common/http";
import { MapiError } from "../errors/mapiError";
import { IAuthenticator, AccessToken } from "../authentication";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";


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
    private environment: string;
    private initializePromise: Promise<void>;
    private requestCache: TtlCache = new TtlCache();

    constructor(
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    private async ensureInitialized(): Promise<void> {
        if (!this.initializePromise) {
            this.initializePromise = this.initialize();
        }
        return this.initializePromise;
    }

    private async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        const managementApiUrl = settings[Constants.SettingNames.managementApiUrl];

        if (!managementApiUrl) {
            throw new Error(`Management API URL ("${Constants.SettingNames.managementApiUrl}") setting is missing in configuration file.`);
        }

        this.managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);

        const managementApiAccessToken = settings[Constants.SettingNames.managementApiAccessToken];

        if (managementApiAccessToken) {
            const accessToken = AccessToken.parse(managementApiAccessToken);
            await this.authenticator.setAccessToken(accessToken);
        }
        else if (this.environment === "development") {
            console.warn(`Development mode: Please specify ${Constants.SettingNames.managementApiAccessToken}" in configuration file.`);
            return;
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
        const authHeader = httpRequest.headers.find(header => header.name === KnownHttpHeaders.Authorization);
        const portalHeader = httpRequest.headers.find(header => header.name === Constants.portalHeaderName);

        if (!authHeader?.value) {
            const accessToken = await this.authenticator.getAccessTokenAsString();

            if (accessToken) {
                httpRequest.headers.push({ name: KnownHttpHeaders.Authorization, value: `${accessToken}` });
            } else {
                if (!portalHeader) {
                    httpRequest.headers.push(MapiClient.getPortalHeader("unauthorized"));
                } else {
                    portalHeader.value = `${portalHeader.value}-unauthorized`;
                }
            }
        }

        if (!portalHeader && httpRequest.method !== HttpMethod.head) {
            httpRequest.headers.push(MapiClient.getPortalHeader());
        }

        httpRequest.url = `${this.managementApiUrl}${Utils.ensureLeadingSlash(httpRequest.url)}`;
        httpRequest.url = Utils.addQueryParameter(httpRequest.url, `api-version=${Constants.managementApiVersion}`);

        let response: HttpResponse<T>;

        try {
            response = await this.httpClient.send<T>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return await this.handleResponse<T>(response, httpRequest.url);
    }

    private async handleResponse<T>(response: HttpResponse<T>, url: string): Promise<T> {
        let contentType = "";

        if (response.headers) {
            const contentTypeHeader = response.headers.find(h => h.name.toLowerCase() === "content-type");
            contentType = contentTypeHeader ? contentTypeHeader.value.toLowerCase() : "";
        }

        const text = response.toText();

        if (response.statusCode >= 200 && response.statusCode < 300) {
            if (contentType.includes("json") && text.length > 0) {
                return JSON.parse(text) as T;
            }
            else {
                return <any>text;
            }
        } else {
            await this.handleError(response, url);
        }
    }

    private async handleError(errorResponse: HttpResponse<any>, requestedUrl: string): Promise<void> {
        if (errorResponse.statusCode === 429) {
            throw new MapiError("too_many_logins", "Too many attempts. Please try later.");
        }

        if (errorResponse.statusCode === 401) {
            const authHeader = errorResponse.headers.find(h => h.name.toLowerCase() === "www-authenticate");

            if (authHeader && authHeader.value.indexOf("Basic") !== -1) {
                if (authHeader.value.indexOf("identity_not_confirmed") !== -1) {
                    throw new MapiError("identity_not_confirmed", "User status is Pending. Please check confirmation email.");
                }
                if (authHeader.value.indexOf("invalid_identity") !== -1) {
                    throw new MapiError("invalid_identity", "Invalid email or password.");
                }
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
                return new MapiError("Unauthorized", "Unauthorized request.");

            case 403:
                return new MapiError("Forbidden", "You're not authorized to perform this operation.");

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

    public static getPortalHeader(eventName?: string): HttpHeader {
        let host = "";
        try {
            host = window.location.host;
        } catch (error) {
            host = "publishing";
        }

        return { name: Constants.portalHeaderName, value: `${Constants.developerPortalType}|${host}|${eventName || ""}` };
    }
}