import { HttpClient, HttpHeader, HttpRequest, HttpResponse } from "@paperbits/common/http";

export class StaticDataHttpClient implements HttpClient {
    private readonly mockDataPath: string = `/tests/mocks/defaultMockData.json`;
    private readonly defaultTemplatePath: string = `/editors/templates/default.json`;
    private initPromise: Promise<void>;
    private defaultTemplateObject: Object;
    private mockDataObject: Object;

    constructor() { }

    private async initialize(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        let response = await this.sendRequestInternal({
            url: this.defaultTemplatePath,
            method: "GET"
        });
        this.defaultTemplateObject = response.toObject();

        response = await this.sendRequestInternal({
            url: this.mockDataPath,
            method: "GET"
        });
        this.mockDataObject = response.toObject();

    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }
        return this.initPromise;
    }

    private parseHeaderString(headerString: string): HttpHeader[] {
        if (!headerString) {
            return [];
        }

        const headers = [];
        const headerPairs = headerString.split("\u000d\u000a");

        for (const headerPair of headerPairs) {
            const index = headerPair.indexOf("\u003a\u0020");

            if (index > 0) {
                const name = headerPair.substring(0, index);
                const value = headerPair.substring(index + 2);

                const header: HttpHeader = {
                    name: name,
                    value: value
                };

                headers.push(header);
            }
        }
        return headers;
    }

    private sendRequestInternal<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (!request.method) {
            request.method = "GET";
        }

        if (!request.headers) {
            request.headers = [];
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            const onRequestTimeout = () => {
                reject({
                    message: `Request timed out. Please try again later.`,
                    code: "RequestError",
                    details: []
                });
            };

            const onStateChange = () => {
                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status === 0) {
                    reject({
                        message: `Could not complete the request. Please try again later.`,
                        code: "RequestError",
                        requestedUrl: request.url,
                        details: []
                    });
                    return;
                }

                const response = new HttpResponse<T>();
                response.statusCode = xhr.status;
                response.statusText = xhr.statusText;
                response.headers = this.parseHeaderString(xhr.getAllResponseHeaders());
                response.body = new Uint8Array(xhr.response);

                resolve(response);
            };

            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = onStateChange.bind(this);
            xhr.ontimeout = onRequestTimeout.bind(this);

            xhr.open(request.method, request.url, true);

            request.headers.forEach((header) => {
                xhr.setRequestHeader(header.name, header.value);
            });

            xhr.send(request.body);
        });
    }

    async send<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (request.method === undefined) {
            request.method = 'GET';
        }

        let response = new HttpResponse<T>();
        // if (request.method === 'GET') {
        await this.ensureInitialized();

        let result: any;

        if (request.url.match("contentTypes\/.*\/contentItems")) {
            result = this.defaultTemplateObject[request.url];
        }

        let urlWithoutParameters = request.url.split('?')[0];
        result = (this.mockDataObject[urlWithoutParameters]);
        if (result == undefined) {
            throw new Error(`No mock data for: ${urlWithoutParameters}`);
        }

        response.headers = result.headers;
        response.statusCode = result.statusCode;
        response.statusText = result.statusText;
        response.body = Buffer.from(JSON.stringify(result.body));


        /*response.body = Buffer.from(JSON.stringify(result));
        response.statusCode = 200;
        response.statusText = "OK";
        response.headers = [{ name: 'Content-Type', value: 'application/json' }];*/

        /*}
        else {
            response.statusCode = 200;
            response.statusText = "OK";
        }*/

        return response;
    }

}