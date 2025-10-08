import * as Constants from "./../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Utils } from "../utils";
import { TtlCache } from "../services/ttlCache";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod, HttpHeader } from "@paperbits/common/http";
import { MapiError, MapiErrorCodes } from "../errors/mapiError";
import { IAuthenticator, AccessToken } from "../authentication";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { KnownMimeTypes } from "../models/knownMimeTypes";
import { Page } from "../models/page";
import { injectable } from "inversify";
import IApiClient from "./IApiClient";
import { Logger } from "@paperbits/common/logging";
import { IRetryStrategy } from "./retryStrategy/retryStrategy";
import { eventTypes } from "../logging/clientLogger";

@injectable()
export default abstract class ApiClient implements IApiClient {
    protected baseUrl: string;
    private environment: string;
    private developerPortalType: string;
    private initializePromise: Promise<void>;
    private requestCache: TtlCache = new TtlCache();

    constructor(
        protected readonly httpClient: HttpClient,
        protected readonly authenticator: IAuthenticator,
        protected readonly settingsProvider: ISettingsProvider,
        protected readonly retryStrategy: IRetryStrategy,
        protected readonly logger: Logger
    ) { }

    protected abstract setBaseUrl(): Promise<void>;

    protected abstract setUserPrefix(query: string, userId?: string): string;

    protected abstract getApiVersion(): string;

    private async ensureInitialized(): Promise<void> {
        if (!this.initializePromise) {
            this.initializePromise = this.initialize();
        }
        return this.initializePromise;
    }

    private async initialize(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();
        this.environment = settings["environment"];

        await this.setBaseUrl();

        if (!this.baseUrl) {
            throw new Error(`Base API URL ("${Constants.SettingNames.backendUrl}") setting is missing in configuration file.`);
        }

        this.developerPortalType = settings[Constants.SettingNames.developerPortalType] || Constants.DeveloperPortalType.selfHosted;

        let managementApiAccessToken = await this.authenticator.getAccessTokenAsString();

        if (!managementApiAccessToken) {
            // fallback to configuration file
            managementApiAccessToken = settings[Constants.SettingNames.managementApiAccessToken] || settings[Constants.SettingNames.armAccessToken];

            if (managementApiAccessToken) {
                const accessToken = AccessToken.parse(managementApiAccessToken);
                await this.authenticator.setAccessToken(accessToken);
            }
        }

        if (!managementApiAccessToken) {
            console.warn(`Development mode: Please check token for ${this.environment} environment.`);
        }
    }

    private async requestInternal<T>(httpRequest: HttpRequest): Promise<T> {
        if (!httpRequest.url) {
            throw new Error("Request URL cannot be empty.");
        }

        await this.ensureInitialized();

        httpRequest.headers = httpRequest.headers || [];

        if (httpRequest.body && !httpRequest.headers.some(x => x.name === KnownHttpHeaders.ContentType)) {
            httpRequest.headers.push({ name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json });
        }

        if (!httpRequest.headers.some(x => x.name === "Accept")) {
            httpRequest.headers.push({ name: "Accept", value: "*/*" });
        }

        if (typeof (httpRequest.body) === "object") {
            httpRequest.body = JSON.stringify(httpRequest.body);
        }

        const call = () => this.retryStrategy.invokeCall<T>(() => this.makeRequest<T>(httpRequest));
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
            key += ":" + httpRequest.headers.sort().map(k => `${k?.name?.toString()}=${k?.value?.toString()}`).join("&");
        }

        return key;
    }

    private async makeRequest<T>(httpRequest: HttpRequest): Promise<T> {
        const response = await this.makeRequestRaw<T>(httpRequest);
        return await this.handleResponse<T>(response, httpRequest.url);
    }

    private async makeRequestRaw<T>(httpRequest: HttpRequest): Promise<HttpResponse<T>> {
        const authHeader = httpRequest.headers.find(header => header.name === KnownHttpHeaders.Authorization);
        const portalHeader = httpRequest.headers.find(header => header.name === Constants.portalHeaderName);
        const isUserResourceHeader = httpRequest.headers.find(header => header.name === Constants.isUserResourceHeaderName);
        let additionalPortalHeaderData = "";

        if (!authHeader?.value) {
            const accessToken = await this.authenticator.getAccessToken();

            if (accessToken) {
                httpRequest.headers.push({ name: KnownHttpHeaders.Authorization, value: `${accessToken.toString()}` });
            } else {
                if (!portalHeader) {
                    additionalPortalHeaderData += "unauthorized";
                } else {
                    portalHeader.value = `${portalHeader.value}-unauthorized`;
                }
            }

            if (isUserResourceHeader?.value == "true") {
                httpRequest.url = this.setUserPrefix(httpRequest.url, accessToken?.userId);
                const indexOfisUserHeader = httpRequest.headers.indexOf(isUserResourceHeader);
                if (indexOfisUserHeader !== -1) {
                    httpRequest.headers.splice(indexOfisUserHeader, 1);
                }
            }
        }

        if (!portalHeader && httpRequest.method !== HttpMethod.head) {
            httpRequest.headers.push(await this.getPortalHeader(additionalPortalHeaderData));
        }

        // Do nothing if absolute URL
        if (!httpRequest.url.startsWith("https://") && !httpRequest.url.startsWith("http://")) {
            httpRequest.url = `${this.baseUrl}${Utils.ensureLeadingSlash(httpRequest.url)}`;
        }

        if (!Utils.IsQueryParameterExists(httpRequest.url, "api-version")) {
            httpRequest.url = Utils.addQueryParameter(httpRequest.url, `api-version=${this.getApiVersion()}`);
        }

        let response: HttpResponse<T>;

        try {
            response = await this.httpClient.send<T>(httpRequest);
            this.logger.trackEvent(eventTypes.clientRequest, { message: `request response`, method: httpRequest.method, requestUrl: httpRequest.url, responseCode: response.statusCode + "" });
        }
        catch (error) {
            this.logger.trackEvent(eventTypes.clientRequest, { message: `request error: ${error?.message}`, method: httpRequest.method, requestUrl: httpRequest.url, responseCode: response?.statusCode + "" });
            throw new Error(`Unable to complete request. Error: ${error.message}`);
        }

        return response;
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
            const retryAfterHeader = errorResponse.headers.find(h => h.name.toLowerCase() === "retry-after");
            throw new MapiError(MapiErrorCodes.TooManyRequest, "Too Many Requests made. Please try later.", retryAfterHeader ? [{
                message: retryAfterHeader.name,
                target: retryAfterHeader.value
            }] : []);
        }

        if (errorResponse.statusCode === 401) {
            const authHeader = errorResponse.headers.find(h => h.name.toLowerCase() === "www-authenticate");

            if (authHeader && authHeader.value.indexOf("Basic") !== -1) {
                if (authHeader.value.indexOf("identity_not_confirmed") !== -1) {
                    throw new MapiError(MapiErrorCodes.IdentityNotConfirmed, "User status is Pending. Please check confirmation email.");
                }
                if (authHeader.value.indexOf("invalid_identity") !== -1) {
                    throw new MapiError(MapiErrorCodes.InvalidIdentity, "Invalid email or password.");
                }
            }
        }

        const error = this.createMapiError(errorResponse.statusCode, requestedUrl, () => {
            const error = errorResponse.toObject();
            if (error.message != null) {
                return (JSON.parse(error.message)).error;
            } else {
                return error.error;
            }
        });

        if (error) {
            throw error;
        }

        throw new MapiError(MapiErrorCodes.Unhandled, "Unhandled error");
    }

    private createMapiError(statusCode: number, url: string, getError: () => any): any {
        switch (statusCode) {
            case 400:
                return getError();
            case 401:
                this.authenticator.clearAccessToken();
                return new MapiError(MapiErrorCodes.Unauthorized, "Unauthorized request.");

            case 403:
                return new MapiError(MapiErrorCodes.Forbidden, "You're not authorized to perform this operation.");

            case 404:
                return new MapiError(MapiErrorCodes.NotFound, `Resource not found: ${url}`);

            case 408:
                return new MapiError(MapiErrorCodes.Timeout, "Could not complete the request. Please try again later.");

            case 409:
                return getError();

            case 500:
                return new MapiError(MapiErrorCodes.ServerError, "Internal server error.");

            default:
                return new MapiError(MapiErrorCodes.Unhandled, `Unexpected status code in SMAPI response: ${statusCode}.`);
        }
    }

    public async getAll<T>(url: string, headers?: HttpHeader[]): Promise<T[]> {
        const allItems: T[] = [];
        const call = (requestUrl: string) => this.makeRequest<Page<T>>({
            method: HttpMethod.get,
            url: requestUrl,
            headers: headers
        });

        const takeResult = (result: Page<T>): Promise<T[]> => {
            if (result) {
                if (Array.isArray(result)) {
                    return Promise.resolve(result);
                }

                if (result.value) {
                    allItems.push(...result.value);
                }
                if (result.nextLink) {
                    const nextLink = this.prepareNextLink(result.nextLink);
                    return call(nextLink).then(takeResult);
                }
            }
            return Promise.resolve(allItems);
        };

        // TODO: fix caching for getAll
        return this.get(url, headers).then(takeResult);
    }

    protected prepareNextLink(nextLink: string): string {
        if (!nextLink)
            return "";

        const url = new URL(nextLink);
        if (url.protocol === "https:"
            && url.port !== "443"
            && (url.hostname == "127.0.0.1" || url.hostname == "localhost")) {
            url.protocol = "http:";
            return url.toString();
        }
        return nextLink;
    }

    public get<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse> {
        return this.requestInternal<TResponse>({
            method: HttpMethod.get,
            url: url,
            headers: headers
        });
    }

    public send<TResponse>(url: string, httpMethod: string, headers?: HttpHeader[], body?: any): Promise<HttpResponse<TResponse>> {
        return this.makeRequestRaw({
            method: httpMethod,
            url: url,
            headers: headers ?? [],
            body: body
        })
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

    public async getPortalHeader(eventName?: string): Promise<HttpHeader> {
        await this.ensureInitialized();
        let host = "";
        try {
            host = window.location.host;
        } catch (error) {
            host = "publishing";
        }

        return { name: Constants.portalHeaderName, value: `${this.developerPortalType}|${host}|${eventName || ""}` };
    }
}