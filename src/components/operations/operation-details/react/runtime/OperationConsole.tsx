import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient } from "@paperbits/common/http/httpClient";
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
    OverlayDrawer,
    Spinner,
    Tooltip,
    isTruncatableBreadcrumbContent,
    truncateBreadcrumbLongName
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { ConsoleOperation } from "../../../../../models/console/consoleOperation";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { ApiService } from "../../../../../services/apiService";
import { OAuthService } from "../../../../../services/oauthService";
import { ProductService } from "../../../../../services/productService";
import { TenantService } from "../../../../../services/tenantService";
import { UsersService } from "../../../../../services/usersService";
import { RequestBodyType, ServiceSkuName, TypeOfApi } from "../../../../../constants";
import { ConsoleAuthorization, ProductSubscriptionKeys } from "./operation-console/ConsoleAuthorization";
import { ConsoleBody } from "./operation-console/ConsoleBody";
import { ConsoleHeaders } from "./operation-console/ConsoleHeaders";
import { ConsoleHosts } from "./operation-console/ConsoleHosts";
import { ConsoleParameters } from "./operation-console/ConsoleParameters";
import { ConsoleRequestResponse } from "./operation-console/ConsoleRequestResponse";
import { getAuthServers, getBackendUrl, loadSubscriptionKeys, setupOAuth } from "./operation-console/consoleUtils";

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
    const [authorizationServers, setAuthorizationServers] = useState<AuthorizationServer[]>([]);
    const [products, setProducts] = useState<ProductSubscriptionKeys[]>([]);
    const [selectedSubscriptionKey, setSelectedSubscriptionKey] = useState<string>(null);
    const [isConsumptionMode, setIsConsumptionMode] = useState<boolean>(false);
    const [backendUrl, setBackendUrl] = useState<string>("");

    const consoleOperation = useRef(new ConsoleOperation(api, operation));
    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    useEffect(() => {
        setWorking(true);
        consoleOperation.current.host.hostname(hostnames[0]);
        Promise.all([
            getAuthServers(api, oauthService).then(authServers => {
                setAuthorizationServers(authServers);
                if (authServers.length > 0) {
                    setupOAuth(api, authServers?.[0], consoleOperation.current.request.headers(), sessionManager).then(newHeaders => {
                        consoleOperation.current.request.headers(newHeaders);
                    });
                }
            }),
            loadSubscriptionKeys(api, apiService, productService, usersService).then(products => {
                setProducts(products);
                if (products.length > 0) {
                    setSelectedSubscriptionKey(products[0].subscriptionKeys[0]?.value);
                }
            }),
            getSkuName().then(skuName => setIsConsumptionMode(skuName === ServiceSkuName.Consumption)),
            getBackendUrl(settingsProvider).then(url => setBackendUrl(url))
        ])
        .catch(error => new Error(`Unable to load the console details. Error: ${error.message}`))
        .finally(() => {
            setWorking(false);
        });
    }, [api, operation, consoleOperation]);

    useEffect(() => {
        if (!isConsumptionMode && api.type !== TypeOfApi.webSocket) {
            if (!consoleOperation.current.request.headers()?.some(header => header.name() === KnownHttpHeaders.CacheControl)) {
                consoleOperation.current.setHeader(KnownHttpHeaders.CacheControl, "no-cache", "string", "Disable caching.");
            }
        }
        rerender();
    }, [api, isConsumptionMode, consoleOperation, rerender]);

    useEffect(() => {
        if (api.type === TypeOfApi.soap) setSoapHeaders();
    }, [api, consoleOperation, rerender]);

    useEffect(() => {
        api.subscriptionRequired && setSubscriptionKeyHeader(selectedSubscriptionKey || "");
    }, [selectedSubscriptionKey]);

    const getSkuName = async (): Promise<string> => {
        return await tenantService.getServiceSkuName();
    }

    const setSoapHeaders = (): void => {
        const representation = consoleOperation.current.request.representations?.[0];

        if (representation) {
            // SOAP 1.1
            if (representation.contentType.toLowerCase() === KnownMimeTypes.Xml) {
                consoleOperation.current.setHeader(KnownHttpHeaders.SoapAction, `"${consoleOperation.current.urlTemplate.split("=")[1]}"`);
            }

            // SOAP 1.2
            if (representation.contentType.toLowerCase() === KnownMimeTypes.Soap) {
                const contentHeader = consoleOperation.current.request.headers()
                    .find(header => header.name().toLowerCase() === KnownHttpHeaders.ContentType.toLowerCase());

                if (contentHeader) {
                    const contentType = `${contentHeader.value()};action="${consoleOperation.current.urlTemplate.split("=")[1]}"`;
                    contentHeader.value(contentType);
                }
            }
        } else {
            consoleOperation.current.setHeader(KnownHttpHeaders.SoapAction, "\"" + consoleOperation.current.urlTemplate.split("=")[1] + "\"");
        }

        consoleOperation.current.urlTemplate = "";
        rerender();
    }

    const setSubscriptionHeader = (key?: string): ConsoleHeader[] => {
        const headers = consoleOperation.current.request.headers() ?? [];
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

    const setSubscriptionKeyHeader = (key: string = ""): void => {
        const newHeaders = setSubscriptionHeader(key);
        consoleOperation.current.request.headers(newHeaders);
        rerender();
    }

    const updateHostname = (hostname: string) => {
        consoleOperation.current.host.hostname(hostname);
        rerender();
    }

    const updateParameters = (queryParameters: ConsoleParameter[], templateParameters: ConsoleParameter[]) => {
        consoleOperation.current.templateParameters(templateParameters);
        consoleOperation.current.request.queryParameters(queryParameters);
        rerender();
    }

    const updateHeaders = (headers: ConsoleHeader[]) => {
        consoleOperation.current.request.headers(headers);
        rerender();
    }

    const updateHasBody = (hasBody: boolean) => {
        consoleOperation.current.hasBody(hasBody);
        rerender();
    }

    const updateBody = useCallback((body: string) => {
        consoleOperation.current.request.body(body);
        rerender();
    }, [consoleOperation, rerender]);

    const updateBodyBinary = useCallback((body: File) => {
        consoleOperation.current.request.binary(body);
        rerender();
    }, [consoleOperation, rerender]);

    const updateBodyFormat = (bodyFormat: RequestBodyType) => {
        consoleOperation.current.request.bodyFormat(bodyFormat);
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
                                api={api}
                                headers={consoleOperation.current.request.headers()}
                                products={products}
                                subscriptionRequired={api.subscriptionRequired}
                                subscriptionKey={selectedSubscriptionKey}
                                authorizationServers={authorizationServers}
                                sessionManager={sessionManager}
                                oauthService={oauthService}
                                updateHeaders={updateHeaders}
                                selectSubscriptionKey={setSelectedSubscriptionKey}
                            />
                        }
                        <ConsoleParameters
                            queryParameters={consoleOperation.current.request.queryParameters()}
                            templateParameters={consoleOperation.current.templateParameters()}
                            updateParameters={updateParameters}
                        />
                        {api.type !== TypeOfApi.webSocket &&
                            <ConsoleHeaders
                                headers={consoleOperation.current.request.headers()}
                                updateHeaders={updateHeaders}
                            />
                        }
                        {(consoleOperation.current.canHaveBody || consoleOperation.current.hasBody()) &&
                            <ConsoleBody
                                hasBody={consoleOperation.current.hasBody()}
                                body={consoleOperation.current.request.body()}
                                binary={consoleOperation.current.request.binary()}
                                bodyDataItems={consoleOperation.current.request.bodyDataItems()}
                                bodyFormat={consoleOperation.current.request.bodyFormat()}
                                readonlyBodyFormat={consoleOperation.current.request.readonlyBodyFormat}
                                representations={consoleOperation.current.request.representations}
                                updateHasBody={updateHasBody}
                                updateBody={updateBody}
                                updateBodyBinary={updateBodyBinary}
                                updateBodyFormat={updateBodyFormat}
                            />
                        }
                        <ConsoleRequestResponse
                            api={api}
                            consoleOperation={consoleOperation.current}
                            backendUrl={backendUrl}
                            useCorsProxy={useCorsProxy}
                            httpClient={httpClient}
                            forceRerender={forceRerender}
                        />
                    </>
                }
            </DrawerBody>
        </OverlayDrawer>
    );
}