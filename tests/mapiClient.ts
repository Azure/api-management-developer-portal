import { TestUtils } from "./testUtils";
import { HttpClient, HttpRequest, HttpResponse, HttpMethod, HttpHeader } from "@paperbits/common/http";

import { KnownHttpHeaders } from "../src/models/knownHttpHeaders";
import { KnownMimeTypes } from "../src/models/knownMimeTypes";
import { CertificateOptions, TestsHttpClient } from "./testsHttpClient";
import { AuthHeaderGenerator } from "./auth/azureTokenProvider";
import * as Constants from "../src/constants";

export class MapiClient {
    private static readonly testsApiVersion: string = "2023-03-01-preview";

    private managementApiUrl: string;
    private static _instance: MapiClient;

    private constructor(private readonly httpClient: HttpClient) {

    }

    private async initialize(): Promise<void> {
        const settings = await TestUtils.getConfigAsync();
        if (!this.isArmUrl(settings["managementUrl"]) && !settings["managementUrl"].includes("/mapi")) {
            this.managementApiUrl = `${settings["managementUrl"]}/subscriptions/000/resourceGroups/000/providers/Microsoft.ApiManagement/service/000/`;
        } else {
            this.managementApiUrl = `${settings["managementUrl"]}`;
        }
    }

    private isArmUrl(resourceUrl: string): boolean {
        const regex = /subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.ApiManagement\/service/i;
        return regex.test(resourceUrl);
    }

    public static get Instance() {
        return this._instance || (this._instance = new this(new TestsHttpClient()));
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

        const authHeader = await AuthHeaderGenerator.Instance.getAuthHeader();
        httpRequest.headers.push({ name: KnownHttpHeaders.Authorization, value: `${authHeader}` });

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
            httpRequest.url = TestUtils.addQueryParameter(httpRequest.url, `api-version=${Constants.managementApiVersion}`);
        }

        let response: HttpResponse<T>;

        try {
            const settings = await TestUtils.getConfigAsync();
            let certificate: Buffer | undefined = undefined;
            if (settings["certificate"]) {
                certificate = Buffer.from(settings["certificate"], "base64");
            }

            console.log(`Sending ${httpRequest.method} request to ${httpRequest.url}`);
            response = await (this.httpClient as TestsHttpClient).send<T>(httpRequest, <CertificateOptions>{ pfxCertificate: certificate });
        }
        catch (error) {
            console.error(error);
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
            throw new Error(`Unable to complete request. Status: ${response.statusCode}. Error: ${text}`);
        }
    }

    public async put<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse> {
        return await this.requestInternal<TResponse>({
            method: HttpMethod.put,
            url: url,
            headers: headers,
            body: body
        });
    }

    public async get<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse> {
        return await this.requestInternal<TResponse>({
            method: HttpMethod.get,
            url: url,
            headers: headers,
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