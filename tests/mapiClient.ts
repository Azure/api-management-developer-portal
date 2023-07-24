import * as Constants from "../src/constants";
import { Utils } from "./utils";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod, HttpHeader } from "@paperbits/common/http";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { KnownHttpHeaders } from "../src/models/knownHttpHeaders";
import { KnownMimeTypes } from "../src/models/knownMimeTypes";

export class MapiClient {
    private managementApiUrl: string;
    private static _instance: MapiClient;
    private token: string;
    private constructor(
        private readonly httpClient: HttpClient
    ) { 
        
    }

    private async initialize(): Promise<void> {
        const settings = await Utils.getConfigAsync();
        this.token = settings["accessToken"];
        this.managementApiUrl = settings["managementUrl"];
    }
    
    public static get Instance()
    {
        return this._instance || (this._instance = new this(new XmlHttpRequestClient()));
    }

    private async requestInternal<T>(httpRequest: HttpRequest): Promise<T> {
        await this.initialize();
        if (!httpRequest.url) {
            throw new Error("Request URL cannot be empty.");
        }
        httpRequest.url = this.managementApiUrl + httpRequest.url;

        httpRequest.headers = httpRequest.headers || [];

        if (httpRequest.body && !httpRequest.headers.some(x => x.name === KnownHttpHeaders.ContentType)) {
            httpRequest.headers.push({ name: KnownHttpHeaders.ContentType, value: KnownMimeTypes.Json });
        }

        httpRequest.headers.push({ name: KnownHttpHeaders.Authorization, value: `${this.token}` });

        if (!httpRequest.headers.some(x => x.name === "Accept")) {
            httpRequest.headers.push({ name: "Accept", value: "*/*" });
        }

        if (typeof (httpRequest.body) === "object") {
            httpRequest.body = JSON.stringify(httpRequest.body);
        }

        const call = async () => this.makeRequest<T>(httpRequest);
        return await call();
    }

    protected async makeRequest<T>(httpRequest: HttpRequest): Promise<T> {
        const url = new URL(httpRequest.url);
        if (!url.searchParams.has("api-version")) {
            httpRequest.url = Utils.addQueryParameter(httpRequest.url, `api-version=${Constants.managementApiVersion}`);
        }

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
        }else{
            throw new Error(`Unable to complete request. Status: ${response.statusCode}. Error: ${text}`);
        }
        return <any>null;
    }

    public async put<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return await this.requestInternal<TResponse>({
            method: HttpMethod.put,
            url: url,
            headers: headers,
            body: body
        });
    }

    public async delete<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return await this.requestInternal<TResponse>({
            method: HttpMethod.delete,
            url: url,
            headers: headers,
            body: body
        });
    }
}