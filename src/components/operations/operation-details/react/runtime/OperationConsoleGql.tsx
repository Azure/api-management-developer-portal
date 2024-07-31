import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as GraphQL from "graphql";
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
    Tab,
    TabList,
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
import { GrantTypes, GraphqlTypes, RequestBodyType, ServiceSkuName, TypeOfApi, downloadableTypes, oauthSessionKey } from "../../../../../constants";
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
import { ConsoleRequestResponse } from "./operation-console/ConsoleRequestResponse";
import { set } from "idb-keyval";
import { GraphQLInputTreeNode, GraphQLOutputTreeNode, GraphQLTreeNode, getType } from "../../ko/runtime/graphql-utilities/graphql-node-models";
import { GraphqlService, TGraphqlTypes } from "../../../../../services/graphqlService";
import { OperationNodes, createFieldStringFromNodes, loadGQLSchema } from "./operation-console/graphqlUtils";

type OperationConsoleProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    api: Api;
    hostnames: string[];
    useCorsProxy: boolean;
    apiService: ApiService;
    graphqlService: GraphqlService;
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

enum ConsoleTab {
    auth = "auth",
    parameters = "parameters",
    headers = "headers",
    queryVariables = "query-variables",
    response = "response"
}

interface GraphqlTreeNode {
    
}

export const OperationConsoleGql = ({
    isOpen,
    setIsOpen,
    api,
    hostnames,
    useCorsProxy,
    apiService,
    graphqlService,
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

    const [backendUrl, setBackendUrl] = useState<string>("");

    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    const [queryParameters, setQueryParameters] = useState<ConsoleParameter[]>([]);
    const [headers, setHeaders] = useState<ConsoleHeader[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>("auth");
    const [host, setHost] = useState<string>(hostnames[0]);
    const [globalNodes, setGlobalNodes] = useState<GraphQLTreeNode[]>([]);
    const [operationNodes, setOperationNodes] = useState<OperationNodes>({ query: null, mutation: null, subscription: null });
    const [document, setDocument] = useState<string>("");

    const generateDocument = useCallback(() => {
        const document = `${createFieldStringFromNodes(globalNodes, 0)}`;
        console.log("document: ", document);
        setDocument(document);
    }, []);

    useEffect(() => {
        setWorking(true);
        console.log('hostnames: ', hostnames);
        //consoleOperation.current.host.hostname(hostnames[0]);
        setDefaultHeader();
        Promise.all([            
            getAuthServers().then(authServers => {
                setAuthorizationServers(authServers);
                if (authServers?.length > 0) {
                    setupOAuth(authServers[0]).then(newHeaders => {
                        setHeaders(newHeaders);
                    });
                }
            }),
            loadSubscriptionKeys().then(products => {
                setProducts(products);
                if (products?.length > 0) {
                    setSelectedSubscriptionKey(products[0].subscriptionKeys[0]?.value);
                }
                console.log("products: ", products);
            }),
            loadGQLSchema(api, apiService, graphqlService, generateDocument).then(({ operationNodes, globalNodes }) => {
                setOperationNodes(operationNodes);
                setGlobalNodes(globalNodes);
            }),
            loadAvailableGraphValues(),
            //getSkuName().then(skuName => setIsConsumptionMode(skuName === ServiceSkuName.Consumption)),
            getBackendUrl().then(url => setBackendUrl(url))
        ])
        .catch(error => new Error(`Unable to load the console details. Error: ${error.message}`))
        .finally(() => {
            setWorking(false);
        });
    }, [api, apiService, graphqlService, generateDocument]);

    useEffect(() => {
        api.subscriptionRequired && setSubscriptionKeyParameter(selectedSubscriptionKey || "");
    }, [selectedSubscriptionKey]);

    useEffect(() => {
        console.log("globalNodes: ", globalNodes);
        generateDocument();
    }, [globalNodes, generateDocument]);

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

        // const userId = await usersService.getCurrentUserId();
        // if (!userId) return;
        
        const userId = '/users/1';

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

   

    const loadAvailableGraphValues = async () => {
        let graphqlTypes: TGraphqlTypes;
        let availableGraphqlTypes: string[];

        try {
            graphqlTypes = (await graphqlService.getGraphqlTypesAndSchema(api.name))?.graphqlTypes;
            availableGraphqlTypes = await graphqlService.getAvailableGraphqlTypes(graphqlTypes);

            if (availableGraphqlTypes) {
                console.log("availableGraphqlTypes: ", availableGraphqlTypes);
            }
        } catch (error) {
            throw new Error(`Unable to get GraphQL types. Error: ${error.message}`);
        }

        return availableGraphqlTypes;
    }

    

   

    const setDefaultHeader = () => {
        const defaultHeader = new ConsoleHeader();
        defaultHeader.name(KnownHttpHeaders.ContentType);
        defaultHeader.value(KnownMimeTypes.Json);
        defaultHeader.description = "Content type header.";
        defaultHeader.required = false;
        defaultHeader.type = "string";
        defaultHeader.inputTypeValue("text");

        setHeaders([defaultHeader]);
    }

    const setSubscriptionKeyParameter = (subscriptionKey?: string): void => {
        let subscriptionKeyParamName = "subscription-key";

        if (api.subscriptionKeyParameterNames?.query) {
            subscriptionKeyParamName = api.subscriptionKeyParameterNames.query;
        }
        
        const searchName = subscriptionKeyParamName.toLocaleLowerCase();
        const newQueryParaemeters = queryParameters.filter(x => x.name()?.toLocaleLowerCase() !== searchName);

        const keyParameter = new ConsoleParameter();
        keyParameter.name(subscriptionKeyParamName);
        keyParameter.secret = true;
        keyParameter.type = "string";
        keyParameter.canRename = false;
        keyParameter.required = true;
        keyParameter.inputType("password");
        keyParameter.value(subscriptionKey);
        
        newQueryParaemeters.push(keyParameter);
        setQueryParameters([...newQueryParaemeters]);
    }
    
    const setAuthHeader = (accessToken: string): ConsoleHeader[] => {
        const headersArray = headers;
        const oldHeader = headersArray.find(header => header.name() === KnownHttpHeaders.Authorization);
    
        if (oldHeader) {
            const newHeaders: ConsoleHeader[] = headersArray.map(header => {
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
    
        headersArray.push(authHeader);
    
        return headersArray;
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

    const onGrantTypeChange = async (authorizationServer: AuthorizationServer, grantType: string): Promise<void> => {
        await clearStoredCredentials();

        if (!grantType || grantType === GrantTypes.password) {
            const authHeader = headers.find(header => header.name() === KnownHttpHeaders.Authorization);
            if (authHeader) {
                const newHeaders = headers.filter(header => header.id !== authHeader.id);
                setHeaders([...newHeaders]);
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



    const updateParameters = (queryParameters: ConsoleParameter[]) => {
        setQueryParameters(queryParameters);
    }

    const updateHeaders = (headers: ConsoleHeader[]) => {
        setHeaders(headers);
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
            size="large"
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
                    </Breadcrumb>
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
                {working
                    ? <Spinner label="Loading..." labelPosition="below" size="small" />
                    : <>
                        <Stack horizontal verticalAlign="center" horizontalAlign="space-between" className={"console-gql-header"}>
                            <Body1>Query editor</Body1>
                            <Button
                                appearance="primary"
                                disabled={sendingRequest}
                                //onClick={() => sendRequest()}
                            >
                                {sendingRequest ? "Sending" : "Send"}
                            </Button>
                        </Stack>
                        <Stack horizontal>
                            <Stack.Item>

                            </Stack.Item>
                            <Stack.Item>
                                <Stack>
                                    <Stack.Item>
                                        
                                    </Stack.Item>
                                    <Stack.Item>
                                        <TabList onTabSelect={(event, data) => setSelectedTab(data.value as string)}>
                                            {(authorizationServers.length > 0 || api.subscriptionRequired) && <Tab value={ConsoleTab.auth}>Authorization</Tab>}
                                            <Tab value={ConsoleTab.parameters}>Parameters</Tab>
                                            <Tab value={ConsoleTab.headers}>Headers</Tab>
                                            <Tab value={ConsoleTab.queryVariables}>Query variables</Tab>
                                            <Tab value={ConsoleTab.response}>Response</Tab>
                                        </TabList>
                                    </Stack.Item>
                                </Stack>
                            </Stack.Item>
                        </Stack>
                        {selectedTab === ConsoleTab.auth && (authorizationServers.length > 0 || api.subscriptionRequired) &&
                            <ConsoleAuthorization
                                authorizationServers={authorizationServers}
                                subscriptionRequired={api.subscriptionRequired}
                                products={products}
                                onGrantTypeChange={onGrantTypeChange}
                                authorizeWithPassword={authenticateOAuthWithPassword}
                                selectSubscriptionKey={setSelectedSubscriptionKey}
                                isGqlConsole={true}
                            />
                        }
                        {selectedTab === ConsoleTab.parameters &&
                            <ConsoleParameters
                                queryParameters={queryParameters}
                                updateParameters={updateParameters}
                                isGqlConsole={true}
                            />
                        }
                        {selectedTab === ConsoleTab.headers &&
                            <ConsoleHeaders
                                headers={headers}
                                updateHeaders={updateHeaders}
                                isGqlConsole={true}
                            />
                        }
                    </>
                }
            </DrawerBody>
        </OverlayDrawer>
    );
}