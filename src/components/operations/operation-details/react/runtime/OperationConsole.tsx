import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { saveAs } from "file-saver";
import { getExtension } from "mime";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient, HttpHeader, HttpMethod, HttpRequest } from "@paperbits/common/http";
import { Stack } from "@fluentui/react";
import {
    Body1,
    Body1Strong,
    Breadcrumb,
    BreadcrumbButton,
    BreadcrumbDivider,
    BreadcrumbItem,
    Button,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Dropdown,
    Option,
    OverlayDrawer,
    Spinner,
    Tooltip,
    isTruncatableBreadcrumbContent,
    truncateBreadcrumbLongName
} from "@fluentui/react-components";
import { ChevronUp20Regular, Copy16Regular, DismissRegular, EyeOffRegular, EyeRegular } from "@fluentui/react-icons";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { ConsoleOperation } from "../../../../../models/console/consoleOperation";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { ApiService } from "../../../../../services/apiService";
import { OAuthService } from "../../../../../services/oauthService";
import { ProductService } from "../../../../../services/productService";
import { TemplatingService } from "../../../../../services/templatingService";
import { TenantService } from "../../../../../services/tenantService";
import { UsersService } from "../../../../../services/usersService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { OAuth2AuthenticationSettings } from "../../../../../contracts/authenticationSettings";
import { GrantTypes, RequestBodyType, ServiceSkuName, TypeOfApi, downloadableTypes, oauthSessionKey } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { ConsoleAuthorization } from "./operation-console/ConsoleAuthorization";
import { ConsoleHeaders } from "./operation-console/ConsoleHeaders";
import { ConsoleBody } from "./operation-console/ConsoleBody";
import { ConsoleParameters } from "./operation-console/ConsoleParameters";
import { templates } from "./operation-console/templates/templates";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";
import { ConsoleHosts } from "./operation-console/ConsoleHosts";


import { HttpResponse } from "../../../../../contracts/httpResponse";
import { KnownStatusCodes } from "../../../../../models/knownStatusCodes";
import { RequestError } from "../../../../../errors/requestError";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

type OperationConsoleProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    api: Api;
    operation: Operation;
    hostnames: string[];
    useCorsProxy: boolean;
    apiService: ApiService;
    usersService: UsersService;
    productService: ProductService;
    oauthService: OAuthService;
    tenantService: TenantService;
    routeHelper: RouteHelper;
    settingsProvider: ISettingsProvider;
    sessionManager: SessionManager;
    httpClient: HttpClient;
}

interface StoredCredentials {
    grantType: string;
    accessToken: string;
}

interface OAuthSession {
    [apiName: string]: StoredCredentials;
}

interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: HttpHeader[];
    body: any;
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

export const OperationConsole = ({
    isOpen,
    setIsOpen,
    api,
    operation,
    hostnames,
    useCorsProxy,
    apiService,
    usersService,
    productService,
    oauthService,
    tenantService,
    routeHelper,
    settingsProvider,
    sessionManager,
    httpClient
}: OperationConsoleProps) => {
    const [working, setWorking] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [hasInitialAuthHeader, setHasInitialAuthHeader] = useState<boolean>(false);
    const [authorizationServers, setAuthorizationServers] = useState<AuthorizationServer[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedSubscriptionKey, setSelectedSubscriptionKey] = useState<string>(null);

    const [isRequestCollapsed, setIsRequestCollapsed] = useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isSecretsRevealed, setIsSecretsRevealed] = useState<boolean>(false);
    const [codeSample, setCodeSample] = useState<string>("");
    const [isConsumptionMode, setIsConsumptionMode] = useState<boolean>(false);
    const [backendUrl, setBackendUrl] = useState<string>("");
    const [formattedResponse, setFormattedResponse] = useState<string>(null);
    const [requestError, setRequestError] = useState<string>("");

    const consoleOperation = useRef(new ConsoleOperation(api, operation));
    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    useEffect(() => {
        setWorking(true);
        console.log('hostnames: ', hostnames);
        consoleOperation.current.host.hostname(hostnames[0]);
        api.type === TypeOfApi.webSocket ? setSelectedLanguage("ws_wscat") : setSelectedLanguage("http");
        Promise.all([            
            getAuthServers().then(authServers => {
                setAuthorizationServers(authServers);
                if (authServers.length > 0) {
                    setupOAuth(authServers[0]).then(newHeaders => {
                        consoleOperation.current.request.headers(newHeaders);
                    });
                }
            }),
            loadSubscriptionKeys().then(products => {
                setProducts(products);
                if (products.length > 0) {
                    setSelectedSubscriptionKey(products[0].subscriptionKeys[0]?.value);
                }
                console.log("products: ", products);
            }),
            getSkuName().then(skuName => setIsConsumptionMode(skuName === ServiceSkuName.Consumption)),
            getBackendUrl().then(url => setBackendUrl(url))
        ])
        .catch(error => new Error(`Unable to load the console details. Error: ${error.message}`))
        .finally(() => {
            setWorking(false);
        });
    }, [api, operation, consoleOperation]);

    useEffect(() => {
        !isConsumptionMode && api.type !== TypeOfApi.webSocket
            && !consoleOperation.current.request.headers().some(header => header.name() === KnownHttpHeaders.CacheControl)
            && consoleOperation.current.setHeader(KnownHttpHeaders.CacheControl, "no-cache", "string", "Disable caching.");
        rerender();
    }, [api, isConsumptionMode, consoleOperation, rerender]);

    useEffect(() => {
        api.subscriptionRequired && setSubscriptionKeyHeader(selectedSubscriptionKey || "");
    }, [selectedSubscriptionKey]);

    useEffect(() => {
        console.log('reremder');
        !!selectedLanguage && getCodeSample().then(code => setCodeSample(code));
    }, [selectedLanguage, forceRerender]);

    const getCodeSample = async (showSecrets = isSecretsRevealed): Promise<string> => {
        const template = templates[selectedLanguage];
        const codeSample = await TemplatingService.render(template, { console: consoleOperation.current, showSecrets });
        return codeSample;
    }

    const getSkuName = async (): Promise<string> => {
        return await tenantService.getServiceSkuName();
    }

    const getBackendUrl = async (): Promise<string> => {
        return await settingsProvider.getSetting<string>("backendUrl");
    }

    const getAuthServers = async (): Promise<AuthorizationServer[]> => {
        let associatedAuthServers: AuthorizationServer[];

        if (api.authenticationSettings?.oAuth2AuthenticationSettings?.length > 0) {
            associatedAuthServers = await oauthService.getOauthServers(api.id);
        } else if (api.authenticationSettings?.openidAuthenticationSettings?.length > 0) {
            associatedAuthServers = await oauthService.getOpenIdAuthServers(api.id);
        }

        return associatedAuthServers ? associatedAuthServers.filter(a => a.useInTestConsole) : [];
    }

    const loadSubscriptionKeys = async () => {
        if (!api.subscriptionRequired) return;

        const userId = await usersService.getCurrentUserId();
        if (!userId) return;
        
        //const userId = '/users/1';

        const pageOfProducts = await apiService.getAllApiProducts(api.id);
        const products = pageOfProducts && pageOfProducts.value ? pageOfProducts.value : [];
        const pageOfSubscriptions = await productService.getSubscriptions(userId);
        const subscriptions = pageOfSubscriptions.value.filter(subscription => subscription.state === SubscriptionState.active);
        const availableProducts = [];

        products.forEach(product => {
            const keys = [];

            subscriptions.forEach(subscription => {
                if (!productService.isScopeSuitable(subscription.scope, api.name, product.name)) {
                    return;
                }

                keys.push({
                    name: `Primary: ${subscription.name?.trim() || subscription.primaryKey.substr(0, 4)}`,
                    value: subscription.primaryKey
                });

                keys.push({
                    name: `Secondary: ${subscription.name?.trim() || subscription.secondaryKey.substr(0, 4)}`,
                    value: subscription.secondaryKey
                });
            });

            if (keys.length > 0) {
                availableProducts.push({ name: product.displayName, subscriptionKeys: keys });
            }
        });

        return availableProducts;
    }

    const setSubscriptionHeader = (key?: string): ConsoleHeader[] => {
        const headers = consoleOperation.current.request.headers();
        let subscriptionHeaderName: string = KnownHttpHeaders.OcpApimSubscriptionKey;
    
        if (api.subscriptionKeyParameterNames && api.subscriptionKeyParameterNames.header) {
            subscriptionHeaderName = api.subscriptionKeyParameterNames.header;
        }
    
        const newHeaders = headers.filter(header => header.name() !== subscriptionHeaderName);
        
        const subscriptionHeader = new ConsoleHeader();
        subscriptionHeader.name(subscriptionHeaderName);
        subscriptionHeader.value(key || "");
        subscriptionHeader.description = "Subscription key.";
        subscriptionHeader.required = true;
        subscriptionHeader.secret(true);
        subscriptionHeader.type = "string";
        subscriptionHeader.inputTypeValue("password");
    
        newHeaders.push(subscriptionHeader);
    
        return newHeaders;
    }
    
    const setAuthHeader = (accessToken: string): ConsoleHeader[] => {
        const headers = consoleOperation.current.request?.headers();
        const oldHeader = headers.find(header => header.name() === KnownHttpHeaders.Authorization);
    
        if (oldHeader) {
            const newHeaders: ConsoleHeader[] = headers.map(header => {
                header.id === oldHeader.id && header.value(accessToken);
                return header;
            });
    
            return newHeaders;
        }
    
        const authHeader = new ConsoleHeader();
        authHeader.name(KnownHttpHeaders.Authorization);
        authHeader.value(accessToken);
        authHeader.description = "Authorization header.";
        authHeader.required = false;
        authHeader.secret(true);
        authHeader.type = "string";
        authHeader.inputTypeValue("password");
    
        headers.push(authHeader);
    
        return headers;
    }   

    const setupOAuth = async (authServer: AuthorizationServer) => {
        const serverName = authServer.name;

        const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);
        const storedCredentials = await getStoredCredentials(serverName, scopeOverride);

        console.log("storedCredentials: ", storedCredentials);

        let newHeaders: ConsoleHeader[];

        if (storedCredentials) {
            //this.selectedGrantType(storedCredentials.grantType);
            newHeaders = setAuthHeader(storedCredentials.accessToken);
        }

        return newHeaders;
    }

    const getSelectedAuthServerOverrideScope = (selectedAuthServerName: string, oAuth2Settings: OAuth2AuthenticationSettings[]): string => {
        if (selectedAuthServerName && oAuth2Settings) {
            const authServerName = selectedAuthServerName.toLowerCase();
            const setting = oAuth2Settings.find(setting => setting.authorizationServerId?.toLowerCase() == authServerName);
            return setting?.scope;
        }

        return null;
    }
    
    const clearStoredCredentials = async (): Promise<void> => {
        await sessionManager.removeItem(oauthSessionKey);
    }

    const getStoredCredentials = async (serverName: string, scopeOverride: string): Promise<StoredCredentials> => {
        const oauthSession = await sessionManager.getItem<OAuthSession>(oauthSessionKey);
        const recordKey = serverName + (scopeOverride ? `-${scopeOverride}` : "");
        const storedCredentials = oauthSession?.[recordKey];

        try {
            /* Trying to check if it's a JWT token and, if yes, whether it got expired. */
            const jwtToken = Utils.parseJwt(storedCredentials.accessToken.replace(/^bearer /i, ""));
            const now = new Date();

            if (now > jwtToken.exp) {
                await clearStoredCredentials();
                return null;
            }
        }
        catch (error) {
            // do nothing
        }

        return storedCredentials;
    }

    const setStoredCredentials = async (serverName: string, scopeOverride: string, grantType: string, accessToken: string): Promise<void> => {
        const oauthSession = await sessionManager.getItem<OAuthSession>(oauthSessionKey) || {};
        const recordKey = serverName + (scopeOverride ? `-${scopeOverride}` : "");

        oauthSession[recordKey] = {
            grantType: grantType,
            accessToken: accessToken
        };

        await sessionManager.setItem<object>(oauthSessionKey, oauthSession);
    }

    const setSubscriptionKeyHeader = (key: string = ""): void => {
        const newHeaders = setSubscriptionHeader(key);
        consoleOperation.current.request.headers(newHeaders);
        rerender();
    }

    const onGrantTypeChange = async (authorizationServer: AuthorizationServer, grantType: string): Promise<void> => {
        await clearStoredCredentials();

        if (!grantType || grantType === GrantTypes.password) {
            const authHeader = consoleOperation.current.request.headers().find(header => header.name() === KnownHttpHeaders.Authorization);
            if (authHeader) {
                const newHeaders = consoleOperation.current.request.headers().filter(header => header.id !== authHeader.id);
                consoleOperation.current.request.headers(newHeaders);
                rerender();
            }
            return;
        }

        await authenticateOAuth(authorizationServer, grantType);
    }

    const authenticateOAuth = async (authorizationServer: AuthorizationServer, grantType: string): Promise<void> => {
        if (!authorizationServer) return;

        const serverName = authorizationServer.name;
        const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);

        if (scopeOverride) {
            authorizationServer.scopes = [scopeOverride];
        }

        const accessToken = await oauthService.authenticate(grantType, authorizationServer, api.name);

        if (!accessToken) {
            return;
        }

        await setStoredCredentials(serverName, scopeOverride, grantType, accessToken);
        setAuthHeader(accessToken);
    }

    const authenticateOAuthWithPassword = async (authorizationServer: AuthorizationServer, username: string, password: string): Promise<void> => {
        if (!authorizationServer) return;

        const serverName = authorizationServer.name;
        const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);

        if (scopeOverride) {
            authorizationServer.scopes = [scopeOverride];
        }

        const accessToken = await oauthService.authenticatePassword(username, password, authorizationServer);
        await setStoredCredentials(serverName, scopeOverride, GrantTypes.password, accessToken);

        setAuthHeader(accessToken);
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

        const responseBody: Buffer = responsePackage.body
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
        const consoleOperationValues = consoleOperation.current;
        const request = consoleOperationValues.request;
        const url = consoleOperationValues.requestUrl();
        const method = consoleOperationValues.method;
        const headers = [...request.headers()];

        let payload;

        switch (consoleOperationValues.request.bodyFormat()) {
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
                    ? consoleOperationValues.name + "." + fileExtension
                    : consoleOperationValues.name;

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
            //this.logSentRequest(api.name, consoleOperationValues.operationName, method, response.statusCode);
        }
        catch (error) {
            let formattedError = `<div><b>Unable to complete request.</b></div>`;

            if (error instanceof RequestError) {
                formattedError += `<div>${error.message}</div>`;
                console.log("Request error: ", error.message);
                //this.logSentRequest(api.name, consoleOperationValues.operationName, method);
                //return;
            }

            setRequestError(formattedError);
            //this.logger.trackError(error);
        }
        finally {
            setSendingRequest(false);
        }
    }

    const updateHostname = (hostname: string) => {
        consoleOperation.current.host.hostname(hostname);
        rerender();
    }

    const updateParameters = (templateParameters: ConsoleParameter[], queryParameters: ConsoleParameter[]) => {
        consoleOperation.current.templateParameters(templateParameters);
        consoleOperation.current.request.queryParameters(queryParameters);
        rerender();
    }

    const updateHeaders = (headers: ConsoleHeader[]) => {
        consoleOperation.current.request.headers(headers);
        rerender();
    }

    const updateBody = (body: string) => {
        consoleOperation.current.request.body(body);
        rerender();
    }

    const updateBodyBinary = (body: File) => {
        consoleOperation.current.request.binary(body);
        rerender();
    }

    const getApiReferenceUrl = (): string => {
        return routeHelper.getApiReferenceUrl(api.name);
    }

    const renderBreadcrumbItem = (name: string, isCurrent: boolean, url?: string) => (
        <>
            {isTruncatableBreadcrumbContent(name, 20)
                ? <BreadcrumbItem>
                    <Tooltip withArrow content={name} relationship="label">
                        <BreadcrumbButton href={url ?? ""} current={isCurrent}>{truncateBreadcrumbLongName(name, 20)}</BreadcrumbButton>
                    </Tooltip>
                  </BreadcrumbItem>
                : <BreadcrumbItem>
                    <BreadcrumbButton href={url ?? ""} current={isCurrent}>{name}</BreadcrumbButton>
                  </BreadcrumbItem>
            }
        </>
    )

    return (
        <OverlayDrawer
            open={isOpen}
            onOpenChange={(_, { open }) => setIsOpen(open)}
            position="end"
            size="medium"
            className="console-drawer"
        >
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            aria-label="Close console"
                            appearance="subtle"
                            icon={<DismissRegular />}
                            onClick={() => setIsOpen(false)}
                        />
                    }
                >
                    <Breadcrumb>
                        {renderBreadcrumbItem(api.displayName, false, getApiReferenceUrl())}
                        {api.apiVersion &&
                            <>
                                <BreadcrumbDivider />
                                <BreadcrumbItem>
                                    <BreadcrumbButton>{api.apiVersion}</BreadcrumbButton>
                                </BreadcrumbItem>
                            </>
                        }
                        {api.type !== TypeOfApi.webSocket &&
                            <>
                                <BreadcrumbDivider />
                                {renderBreadcrumbItem(consoleOperation?.current.name ?? "", true)}
                            </>
                        }
                    </Breadcrumb>
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
                {(working || !consoleOperation.current) ? <Spinner label="Loading..." labelPosition="below" size="small" />
                    : <>
                        {api.type !== TypeOfApi.webSocket && consoleOperation.current.urlTemplate &&
                            <div className="console-method">
                                <Body1Strong className={`operation-method method-${consoleOperation.current.method}`}>
                                    {consoleOperation.current.method}
                                </Body1Strong>
                                <Body1 className={`operation-name`}>
                                    {consoleOperation.current.urlTemplate}
                                </Body1>
                            </div>
                        }
                        {hostnames.length > 1 &&
                            <ConsoleHosts
                                hostnames={hostnames}
                                updateHostname={updateHostname}
                            />
                        }
                        {(authorizationServers.length > 0 || api.subscriptionRequired) &&
                            <ConsoleAuthorization
                                authorizationServers={authorizationServers}
                                subscriptionRequired={api.subscriptionRequired}
                                products={products}
                                onGrantTypeChange={onGrantTypeChange}
                                authorizeWithPassword={authenticateOAuthWithPassword}
                                selectSubscriptionKey={setSelectedSubscriptionKey}
                            />
                        }
                        <ConsoleParameters
                            templateParameters={consoleOperation.current.templateParameters()}
                            queryParameters={consoleOperation.current.request.queryParameters()}
                            updateParameters={updateParameters}
                        />
                        <ConsoleHeaders
                            headers={consoleOperation.current.request.headers()}
                            updateHeaders={updateHeaders}
                        />
                        {(consoleOperation.current.canHaveBody || consoleOperation.current.hasBody()) &&
                            <ConsoleBody
                                hasBody={consoleOperation.current.hasBody()}
                                request={consoleOperation.current.request}
                                updateBody={updateBody}
                                updateBodyBinary={updateBodyBinary}
                            />
                        }
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
                                            value={api.type === TypeOfApi.webSocket
                                                ? requestLanguagesWs.find(language => language.value === selectedLanguage)?.text
                                                : requestLanguagesRest.find(language => language.value === selectedLanguage)?.text
                                            }
                                            selectedOptions={[selectedLanguage]}
                                            placeholder="Select language"
                                            className={"request-language-dropdown"}
                                            onOptionSelect={(e, data) => setSelectedLanguage(data.optionValue)}
                                        >
                                            {api.type === TypeOfApi.webSocket
                                                ? requestLanguagesWs.map((language, index) => (
                                                    <Option key={index} value={language.value}>{language.text}</Option>
                                                ))
                                                : requestLanguagesRest.map((language, index) => (
                                                    <Option key={index} value={language.value}>{language.text}</Option>
                                                ))
                                            }
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
                }
            </DrawerBody>
        </OverlayDrawer>
    );
}