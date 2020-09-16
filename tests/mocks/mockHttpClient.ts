import { Bag } from "@paperbits/common";
import { HttpClient, HttpHeader, HttpRequest, HttpResponse } from "@paperbits/common/http";
import * as ExtUtils from "@paperbits/common/utils";
import { Utils } from "../../src/utils";

class HttpMockRequestBuilder {
    constructor(private readonly response: HttpResponse<any>) { }

    public reply(status: number, body?: object, headers?: object): void {
        this.response.statusCode = status;

        if (body) {
            this.response.body = ExtUtils.stringToUnit8Array(JSON.stringify(body));
        }

        const responseHeaders = { "Content-Type": "application/json" };

        if (headers) {
            Object.assign(responseHeaders, headers);
        }

        this.response.headers = Object
            .keys(responseHeaders)
            .map<HttpHeader>(name => ({
                name: name,
                value: responseHeaders[name]
            }));
    }
}

class HttpMockBuilder {
    constructor(private readonly handlers: Bag<HttpResponse<any>>) { }

    private configureResponse(method: string, url: string, body?: object): HttpResponse<any> {
        if (!url.startsWith("http")) {
            url = `https://contoso.management.azure-api.com${Utils.ensureLeadingSlash(url)}`;
        }

        url = Utils.ensureUrlArmified(url);

        const parsed = new URL(url);
        const path = parsed.pathname;

        const response = new HttpResponse<any>();
        this.handlers[`${method}|${path}`] = response;

        return response;
    }

    public get(url: string): HttpMockRequestBuilder {
        return new HttpMockRequestBuilder(this.configureResponse("GET", url));
    }

    public put(url: string, body?: object): HttpMockRequestBuilder {
        return new HttpMockRequestBuilder(this.configureResponse("PUT", url, body));
    }

    public post(url: string, body?: object): HttpMockRequestBuilder {
        return new HttpMockRequestBuilder(this.configureResponse("POST", url, body));
    }

    public delete(url: string, body?: object): HttpMockRequestBuilder {
        return new HttpMockRequestBuilder(this.configureResponse("DELETE", url, body));
    }
}

export class MockHttpClient implements HttpClient {
    private handlers: Bag<HttpResponse<any>> = {};

    public async send<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        const requestedUrl = new URL(request.url);
        const response = this.handlers[`${request.method || "GET"}|${requestedUrl.pathname}`];

        if (response) {
            return response;
        }

        const resourceNotFound = new HttpResponse<T>();
        resourceNotFound.statusCode = 404;
        resourceNotFound.body = ExtUtils.stringToUnit8Array("Not found");
        return resourceNotFound;
    }

    public mock(): HttpMockBuilder {
        return new HttpMockBuilder(this.handlers);
    }
}