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
import { ApiService } from "../../../../../services/apiService";
import { OAuthService } from "../../../../../services/oauthService";
import { ProductService } from "../../../../../services/productService";
import { TemplatingService } from "../../../../../services/templatingService";
import { TenantService } from "../../../../../services/tenantService";
import { UsersService } from "../../../../../services/usersService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { OAuth2AuthenticationSettings } from "../../../../../contracts/authenticationSettings";
import { GrantTypes, ServiceSkuName, TypeOfApi, oauthSessionKey } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { ConsoleAuthorization } from "./operation-console/ConsoleAuthorization";
import { ConsoleBody } from "./operation-console/ConsoleBody";
import { ConsoleHeaders } from "./operation-console/ConsoleHeaders";
import { ConsoleHosts } from "./operation-console/ConsoleHosts";
import { ConsoleParameters } from "./operation-console/ConsoleParameters";
import { ConsoleRequestResponse } from "./operation-console/ConsoleRequestResponse";
import { templates } from "./operation-console/templates/templates";

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
    const [products, setProducts] = useState<any[]>([]);
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
            //this.selectedGrantType(storedCredentials.grantType); //TODO
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