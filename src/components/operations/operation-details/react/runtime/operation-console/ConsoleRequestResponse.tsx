import * as React from "react";
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { getExtension } from "mime";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { HttpClient, HttpHeader, HttpMethod, HttpRequest } from "@paperbits/common/http";
import { Stack } from "@fluentui/react";
import { Body1Strong, Button, Dropdown, Option, Tooltip } from "@fluentui/react-components";
import { ChevronUp20Regular, Copy16Regular, EyeOffRegular, EyeRegular } from "@fluentui/react-icons";
import { Api } from "../../../../../../models/api";
import { KnownMimeTypes } from "../../../../../../models/knownMimeTypes";
import { KnownHttpHeaders } from "../../../../../../models/knownHttpHeaders";
import { KnownStatusCodes } from "../../../../../../models/knownStatusCodes";
import { ConsoleOperation } from "../../../../../../models/console/consoleOperation";
import { RequestError } from "../../../../../../errors/requestError";
import { HttpResponse } from "../../../../../../contracts/httpResponse";
import { TemplatingService } from "../../../../../../services/templatingService";
import { Utils } from "../../../../../../utils";
import { MarkdownProcessor } from "../../../../../utils/react/MarkdownProcessor";
import { RequestBodyType, TypeOfApi, downloadableTypes } from "../../../../../../constants";
import { templates } from "./templates/templates";

type ConsoleRequestResponseProps = {
    api: Api;
    consoleOperation: ConsoleOperation;
    backendUrl: string;
    useCorsProxy: boolean;
    httpClient: HttpClient;
    forceRerender: number;
}

const requestLanguagesRest = [
    { value: "http", text: "HTTP" },
    { value: "csharp", text: "C#" },
    { value: "curl", text: "Curl" },
    { value: "java", text: "Java" },
    { value: "javascript", text: "JavaScript" },
    { value: "php", text: "PHP" },
    { value: "python", text: "Python" },
    { value: "ruby", text: "Ruby" },
    { value: "swift", text: "Swift" },
];

const requestLanguagesWs = [
    { value: "ws_wscat", text: "wscat" },
    { value: "ws_csharp", text: "C#" },
    { value: "ws_javascript", text: "JavaScript" }
];

type BufferFromParam = Parameters<typeof Buffer.from>[0];

interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: HttpHeader[];
    body: {
        data: BufferFromParam;
    };
}

export const ConsoleRequestResponse = ({ api, consoleOperation, backendUrl, useCorsProxy, httpClient, forceRerender }: ConsoleRequestResponseProps) => {
    const [isRequestCollapsed, setIsRequestCollapsed] = useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(api.type === TypeOfApi.webSocket ? "ws_wscat" : "http");
    const [requestLanguages, setRequestLanguages] = useState<{ value: string, text: string }[]>(api.type === TypeOfApi.webSocket ? requestLanguagesWs : requestLanguagesRest);
    const [codeSample, setCodeSample] = useState<string>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isSecretsRevealed, setIsSecretsRevealed] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [formattedResponse, setFormattedResponse] = useState<string>(null);
    const [requestError, setRequestError] = useState<string>(null);

    useEffect(() => {
        if (api.type === TypeOfApi.webSocket) {
            setSelectedLanguage("ws_wscat");
            setRequestLanguages(requestLanguagesWs);
        } else {
            setSelectedLanguage("http");
            setRequestLanguages(requestLanguagesRest);
        }
    }, [api]);

    useEffect(() => {
        !!selectedLanguage && getCodeSample().then(code => setCodeSample(code));
    }, [selectedLanguage, consoleOperation, forceRerender]);

    const getCodeSample = async (showSecrets = isSecretsRevealed): Promise<string> => {
        const template = templates[selectedLanguage];
        const codeSample = await TemplatingService.render(template, { console: consoleOperation, showSecrets });
        return codeSample;
    }

    const decompressBody = async (body: Buffer): Promise<string> => {
        const ds = new DecompressionStream("gzip");
        const dsWriter = ds.writable.getWriter();
        dsWriter.write(body);
        dsWriter.close();
        const output: Uint8Array[] = [];
        const reader = ds.readable.getReader();
        let totalSize = 0;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            output.push(value);
            totalSize += value.byteLength;
        }
        const concatenated = new Uint8Array(totalSize);
        let offset = 0;
        for (const array of output) {
            concatenated.set(array, offset);
            offset += array.byteLength;
        }
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(concatenated);
    }

    /**
     * Sends HTTP request to API directly from browser.
     * @param request HTTP request.
     */
    const sendFromBrowser = async (request: HttpRequest): Promise<HttpResponse> => {
        if ((request.method === HttpMethod.get || request.method === HttpMethod.head) && request.body) {
            throw new RequestError("GET requests cannot have a body.");
        }

        const headersRequest: HeadersInit = {};
        request.headers.forEach(header => headersRequest[header.name] = header.value);

        let response: Response;

        try {
            response = await fetch(request.url, {
                method: request.method,
                headers: headersRequest,
                body: request.body,
                redirect: "manual"
            });
        }
        catch (error) {
            throw new RequestError(`Since the browser initiates the request, it requires Cross-Origin Resource Sharing (CORS) enabled on the server. <a href="https://aka.ms/AA4e482" target="_blank">Learn more</a>`);
        }

        const responseHeaders = [];
        response.headers.forEach((value, name) => responseHeaders.push({ name: name, value: value }));

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
        }

        const responseBody = Buffer.concat(chunks);

        const responseReturn: HttpResponse = {
            headers: responseHeaders,
            statusCode: response.status,
            statusText: response.statusText,
            body: responseBody
        };

        return responseReturn;
    }

    /**
     * Sends HTTP request to API using CORS proxy (if configured).
     * @param request HTTP request.
     */
    const sendFromProxy = async (request: HttpRequest): Promise<HttpResponse> => {
        if (request.body) {
            request.body = Buffer.from(request.body);
        }

        const formData = new FormData();
        const requestPackage = new Blob([JSON.stringify(request)], { type: KnownMimeTypes.Json });
        formData.append("requestPackage", requestPackage);

        const baseProxyUrl = backendUrl || "";
        const apiName = api.name;

        const proxiedRequest: HttpRequest = {
            url: `${baseProxyUrl}/send`,
            method: HttpMethod.post,
            headers: [{ name: KnownHttpHeaders.XMsApiName, value: apiName }],
            body: formData
        };

        const proxiedResponse = await httpClient.send<ResponsePackage>(proxiedRequest);
        const responsePackage = proxiedResponse.toObject();

        const responseBody: Buffer | null = responsePackage.body
            ? Buffer.from(responsePackage.body.data)
            : null;

        const response: HttpResponse = {
            headers: responsePackage.headers,
            statusCode: responsePackage.statusCode,
            statusText: responsePackage.statusMessage,
            body: responseBody
        };

        return response;
    }

    const sendRequest  = async (): Promise<void> => {
        setSendingRequest(true);
        const request = consoleOperation.request;
        const url = consoleOperation.requestUrl();
        const method = consoleOperation.method;
        const headers = [...request.headers()];

        let payload;

        switch (consoleOperation.request.bodyFormat()) {
            case RequestBodyType.raw:
                payload = request.body();
                break;

            case RequestBodyType.binary:
                payload = await Utils.readFileAsByteArray(request.binary());
                break;

            case RequestBodyType.form:
                payload = request.getFormDataPayload();
                break;

            default:
                throw new Error("Unknown body format.");
        }

        try {
            const request: HttpRequest = {
                url: url,
                method: method,
                headers: headers
                    .map(x => { return { name: x.name(), value: x.value() ?? "" }; })
                    .filter(x => !!x.name && !!x.value),
                body: payload
            };

            const response: HttpResponse = useCorsProxy
                ? await sendFromProxy(request)
                : await sendFromBrowser(request);

            const headersString = response.headers.map(x => `${x.name}: ${x.value}`).join("\n");
            const contentTypeHeader = response.headers.find(x => x.name === KnownHttpHeaders.ContentType.toLowerCase());
            const responseContentType = contentTypeHeader?.value;

            const responseStatusCode = response.statusCode.toString();

            const knownStatusCode = KnownStatusCodes.find(x => x.code === response.statusCode);

            const responseStatusText = response.statusText || knownStatusCode
                ? knownStatusCode?.description
                : "Unknown";


            let responseBodyFormatted: string = "";

            if (responseContentType && downloadableTypes.some(type => responseContentType.includes(type))) {
                const blob = new Blob([response.body], { type: responseContentType });
                const fileExtension = getExtension(responseContentType);

                const fileName = fileExtension
                    ? consoleOperation.name + "." + fileExtension
                    : consoleOperation.name;

                saveAs(blob, fileName);
            } else {
                let responseBody: string;

                if (useCorsProxy) {
                    const contentEncodingHeader = response.headers.find(x => x.name === KnownHttpHeaders.ContentEncoding.toLowerCase());
                    if (contentEncodingHeader?.value === "gzip") {
                        responseBody = await decompressBody(response.body);
                    } else {
                        responseBody = response.body.toString();
                    }
                } else {
                    responseBody = response.body.toString();
                }

                if (responseContentType && Utils.isJsonContentType(responseContentType)) {
                    responseBodyFormatted = Utils.formatJson(responseBody);
                }
                else if (responseContentType && Utils.isXmlContentType(responseContentType)) {
                    responseBodyFormatted = Utils.formatXml(responseBody);
                }
                else {
                    responseBodyFormatted = responseBody;
                }
            }

            const responseString = `<span>HTTP/1.1</span> <span data-code="${responseStatusCode}"><span data-code="${responseStatusCode}">${responseStatusCode}</span> <span>${responseStatusText}</span></span>

<span>${headersString}</span>

<span>${responseBodyFormatted}</span>`;

            setFormattedResponse(responseString);
            //this.logSentRequest(api.name, consoleOperation.operationName, method, response.statusCode);
        }
        catch (error) {
            let formattedError = `<div><b>Unable to complete request.</b></div>`;

            if (error instanceof RequestError) {
                formattedError += `<div>${error.message}</div>`;
                //this.logSentRequest(api.name, consoleOperation.operationName, method);
            }

            setRequestError(formattedError);
            //this.logger.trackError(error);
        }
        finally {
            setSendingRequest(false);
        }
    }

    return (
        <>
            <div className={"operation-table"}>
                <div className={"operation-table-header"}>
                    <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                        <Stack horizontal verticalAlign="center">
                            <ChevronUp20Regular
                                onClick={() => setIsRequestCollapsed(!isRequestCollapsed)}
                                className={`collapse-button${isRequestCollapsed ? " is-collapsed" : ""}`}
                            />
                            <Body1Strong>HTTP request</Body1Strong>
                        </Stack>
                    </Stack>
                </div>
                {!isRequestCollapsed &&
                    <div className={"operation-table-body-console"}>
                        <Stack horizontal verticalAlign="center">
                            <Dropdown
                                aria-label="Programming language"
                                value={requestLanguages.find(language => language.value === selectedLanguage)?.text}
                                selectedOptions={[selectedLanguage]}
                                placeholder="Select language"
                                className={"request-language-dropdown"}
                                onOptionSelect={(e, data) => setSelectedLanguage(data.optionValue)}
                            >
                                {requestLanguages.map((language, index) => (
                                    <Option key={index} value={language.value}>{language.text}</Option>
                                ))}
                            </Dropdown>
                            <Tooltip
                                content={isCopied ? "Copied to clipboard!" : "Copy to clipboard"}
                                relationship="label"
                                hideDelay={isCopied ? 3000 : 250}
                            >
                                <Button
                                    icon={<Copy16Regular />}
                                    appearance="subtle"
                                    className={"request-copy-button"}
                                    onClick={async () => {
                                        const code = await getCodeSample(true);
                                        navigator.clipboard.writeText(code);
                                        setIsCopied(true);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip content={isSecretsRevealed ? "Hide secrets" : "Reveal secrets"} relationship="label">
                                <Button
                                    icon={isSecretsRevealed ? <EyeOffRegular /> : <EyeRegular />}
                                    appearance="subtle"
                                    onClick={() => {
                                        setIsSecretsRevealed(!isSecretsRevealed);
                                    }}
                                />
                            </Tooltip>
                        </Stack>
                        <SyntaxHighlighter children={codeSample} language={selectedLanguage} style={a11yLight} />
                    </div>
                }
            </div>
            {(formattedResponse || requestError) &&
                <div className={"operation-table"}>
                    <div className={"operation-table-header"}>
                        <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                            <Stack horizontal verticalAlign="center">
                                <Body1Strong>HTTP response</Body1Strong>
                            </Stack>
                        </Stack>
                    </div>
                    <div className={"operation-table-body-console"}>
                        <MarkdownProcessor markdownToDisplay={formattedResponse ?? requestError} />
                    </div>
                </div>
            }
            {selectedLanguage === "http" &&
                <Button
                    appearance="primary"
                    disabled={sendingRequest}
                    onClick={() => sendRequest()}
                >
                    {sendingRequest ? "Sending" : "Send"}
                </Button>
            }
        </>
    );
}