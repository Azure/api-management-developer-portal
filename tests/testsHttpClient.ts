import * as https from "https";
import { HttpClient, HttpRequest, HttpResponse, HttpHeader } from "@paperbits/common/http";

export class CertificateOptions {
    certificate: string;
    privateKey: string;
    pfxCertificate: Buffer;
    thumbprint: string;
}

export class TestsHttpClient implements HttpClient {
    constructor(
        private readonly pfxClientCert?: Buffer,
        private readonly port?: string
    ) { }

    public async get(url: string): Promise<Response> {
        const response = await fetch(url);
        return response;
    }

    public send<T>(request: HttpRequest, certificateOptions?: CertificateOptions): Promise<HttpResponse<T>> {
        const headers = {};
        request.headers?.forEach(header => headers[header.name] = header.value);

        const options: https.RequestOptions = {
            method: request.method,
            headers: headers
        };

        if (this.port) {
            options["port"] = this.port;
        }

        if (certificateOptions?.certificate && certificateOptions?.privateKey) {
            options.cert = certificateOptions.certificate;
            options.key = certificateOptions.privateKey;
        }
        else if (certificateOptions?.pfxCertificate) {
            options["pfx"] = certificateOptions?.pfxCertificate;
        }
        else if (this.pfxClientCert) {
            options["pfx"] = this.pfxClientCert;
        }

        return new Promise((resolve, reject) => {
            const req = https.request(request.url, options, (resp) => {
                const responseData = new Array<Buffer>();

                resp.on("data", (chunk) => {
                    responseData.push(chunk);
                });

                resp.on("end", () => {
                    const responseHeaders = Object.keys(resp.headers).map<HttpHeader>(headerName => {
                        const value: string | string[] | undefined = resp.headers[headerName];

                        return {
                            name: headerName,
                            value: Array.isArray(value)
                                ? value.join(";")
                                : value ?? ""
                        };
                    });

                    const buffer = Buffer.concat(responseData);
                    const response = new HttpResponse<T>();
                    response.statusCode = resp.statusCode ?? 500;
                    response.statusText = resp.statusMessage ?? "";
                    response.headers = responseHeaders;
                    response.body = new Uint8Array(buffer);

                    resolve(response);
                });
            });

            req.on("error", (error) => reject(error));

            if (request.body) {
                req.write(Buffer.from(request.body));
            }

            req.end();
        });
    }
}
