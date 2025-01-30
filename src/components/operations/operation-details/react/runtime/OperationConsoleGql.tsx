import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Editor, { Monaco } from '@monaco-editor/react';
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Stack } from "@fluentui/react";
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Body1,
    Breadcrumb,
    BreadcrumbButton,
    BreadcrumbDivider,
    BreadcrumbItem,
    Button,
    Checkbox,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Dropdown,
    Input,
    Option,
    OverlayDrawer,
    SearchBox,
    Spinner,
    Tab,
    TabList,
    Tooltip,
    isTruncatableBreadcrumbContent,
    truncateBreadcrumbLongName
} from "@fluentui/react-components";
import { DismissRegular, SearchRegular } from "@fluentui/react-icons";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Api } from "../../../../../models/api";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { ApiService } from "../../../../../services/apiService";
import { OAuthService } from "../../../../../services/oauthService";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { GraphqlService, TGraphqlTypes } from "../../../../../services/graphqlService";
import { GraphqlProtocols } from "../../../../../constants";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { Utils } from "../../../../../utils";
import { ConsoleAuthorization } from "./operation-console/ConsoleAuthorization";
import { ConsoleHeaders } from "./operation-console/ConsoleHeaders";
import { ConsoleParameters } from "./operation-console/ConsoleParameters";
import { OperationNodes, createFieldStringFromNodes, documentToTree, loadGQLSchema } from "./operation-console/graphqlUtils";
import { ResponsePackage, getAuthServers, getBackendUrl, loadSubscriptionKeys,setupOAuth } from "./operation-console/consoleUtils";
import { GraphQLInputTreeNode, GraphQLTreeNode } from "./operation-console/graphql-utilities/graphql-node-models";

type OperationConsoleProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    api: Api;
    hostnames: string[];
    selectedGraphType: string;
    selectedGraphName: string;
    useCorsProxy: boolean;
    apiService: ApiService;
    graphqlService: GraphqlService;
    usersService: UsersService;
    productService: ProductService;
    oauthService: OAuthService;
    routeHelper: RouteHelper;
    settingsProvider: ISettingsProvider;
    sessionManager: SessionManager;
    httpClient: HttpClient;
}

enum ConsoleTab {
    auth = "auth",
    parameters = "parameters",
    headers = "headers",
    queryVariables = "query-variables",
    response = "response"
}

export const OperationConsoleGql = ({
    isOpen,
    setIsOpen,
    api,
    hostnames,
    selectedGraphType,
    selectedGraphName,
    useCorsProxy,
    apiService,
    graphqlService,
    usersService,
    productService,
    oauthService,
    routeHelper,
    settingsProvider,
    sessionManager,
    httpClient
}: OperationConsoleProps) => {
    const [working, setWorking] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>(ConsoleTab.auth);
    const [backendUrl, setBackendUrl] = useState<string>("");
    const [authorizationServers, setAuthorizationServers] = useState<AuthorizationServer[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedSubscriptionKey, setSelectedSubscriptionKey] = useState<string>(null);
    const [queryParameters, setQueryParameters] = useState<ConsoleParameter[]>([]);
    const [headers, setHeaders] = useState<ConsoleHeader[]>([]);
    const [availableGraphqlTypes, setAvailableGraphqlTypes] = useState<string[]>([]);
    const [globalNodes, setGlobalNodes] = useState<GraphQLTreeNode[]>([]);
    const [operationNodes, setOperationNodes] = useState<OperationNodes>({ query: null, mutation: null, subscription: null });
    const [document, setDocument] = useState<string>("");
    const [schema, setSchema] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");
    const [queryVariables, setQueryVariables] = useState<string>("");
    const [response, setResponse] = useState<string>("");
    const [responseLanguage, setResponseLanguage] = useState<string>("html");
    const [requestError, setRequestError] = useState<string>(null);

    const generateDocument = useCallback((globalNodes) => {
        const document = createFieldStringFromNodes(globalNodes, 0);
        setDocument(document);
    }, []);

    useEffect(() => {
        setWorking(true);
        setDefaultHeader();
        Promise.all([
            getAuthServers(api, oauthService).then(authServers => {
                setAuthorizationServers(authServers);
                if (authServers?.length > 0) {
                    setupOAuth(api, authServers[0], headers, sessionManager).then(newHeaders => {
                        setHeaders(newHeaders);
                    });
                }
            }),
            loadSubscriptionKeys(api, apiService, productService, usersService).then(products => {
                setProducts(products);
                if (products?.length > 0) {
                    setSelectedSubscriptionKey(products[0].subscriptionKeys[0]?.value);
                }
            }),
            loadGQLSchema(api, selectedGraphType, selectedGraphName, apiService, graphqlService, generateDocument)
                .then(({ operationNodes, globalNodes, schema, availableGraphqlTypes }) => {
                    setOperationNodes(operationNodes);
                    setGlobalNodes(globalNodes);
                    setSchema(schema);
                    setAvailableGraphqlTypes(availableGraphqlTypes);
                }),
            getBackendUrl(settingsProvider).then(url => setBackendUrl(url))
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
        generateDocument(globalNodes);
    }, [globalNodes, generateDocument]);

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

    const handleEditorWillMount = (editor, monaco: Monaco) => {
        monaco.editor.createModel(schema, 'graphql');
    }

    const handleQueryEditorChange = (value: string, event: any) => {
        const nodes = documentToTree(value, globalNodes);
        if (nodes) {
            setGlobalNodes(nodes);
            setDocument(value);
        }
    }

    const handleVariablesEditorChange = (value: string, event: any) => {
        setQueryVariables(value);
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

    const addParam = (uri: string, name: string, value: string): string => {
        const separator = uri.indexOf("?") >= 0 ? "&" : "?";
        const paramString = !value || value === "" ? name : name + "=" + value;

        return uri + separator + paramString;
    }

    const getRequestPath = (getHidden: boolean = false): string => {
        let versionPath = "";
        if (api.apiVersionSet && api.apiVersion && api.apiVersionSet.versioningScheme === "Segment") {
            versionPath = `/${api.apiVersion}`;
        }

        let requestUrl = `${api.path}${versionPath}`;

        queryParameters.forEach(parameter => {
            if (parameter.value()) {
                const parameterPlaceholder = parameter.name() !== "*" ? `{${parameter.name()}}` : "*";
                const encodedValue = Utils.encodeURICustomized(parameter.value());
                if (requestUrl.indexOf(parameterPlaceholder) > -1) {
                    requestUrl = requestUrl.replace(parameterPlaceholder,
                        !getHidden || !parameter.secret ? encodedValue
                            : (parameter.revealed() ? encodedValue : parameter.value().replace(/./g, "•")));
                }
                else {
                    requestUrl = addParam(requestUrl, Utils.encodeURICustomized(parameter.name()),
                        !getHidden || !parameter.secret ? encodedValue
                            : (parameter.revealed() ? encodedValue : parameter.value().replace(/./g, "•")));
                }
            }
        });

        if (api.apiVersionSet && api.apiVersionSet.versioningScheme === "Query") {
            requestUrl = addParam(requestUrl, api.apiVersionSet.versionQueryName, api.apiVersion);
        }

        return requestUrl;
    }

    const requestUrl = (): string => {
        const protocol = api.protocols.includes(GraphqlProtocols.https) ? GraphqlProtocols.https : GraphqlProtocols.http;
        const urlTemplate = getRequestPath();
        let result = hostnames[0] ? `${protocol}://${hostnames[0]}` : "";
        result += Utils.ensureLeadingSlash(urlTemplate);
        return result;
    }

    const sendRequest = async () => {
        setSendingRequest(true);

        if (queryVariables.length > 0) {
            try {
                JSON.parse(queryVariables);
            }
            catch (error) {
                setSelectedTab(ConsoleTab.response);
                setRequestError('Invalid "Query variables" JSON format.');
                setSendingRequest(false);
                return;
            }
        }

        const payload = JSON.stringify({
            query: document,
            variables: queryVariables.length > 0 ? JSON.parse(queryVariables) : null
        });

        const request: HttpRequest = {
            url: requestUrl(),
            method: "POST",
            headers: headers.map(x => { return { name: x.name(), value: x.value() ?? "" }; }).filter(x => !!x.name && !!x.value),
            body: payload
        };

        try {
            let response;
            if (useCorsProxy) {
                response = await sendFromProxy(request);
            }
            else {
                response = await sendFromBrowser(request);
            }

            const contentTypeHeader = response.headers?.get(KnownHttpHeaders.ContentType);
            const mimeType = contentTypeHeader?.split(';').split('/');
            const responseLanguageValue = ["css", "javascript", "json", "xml"].includes(mimeType[1]) ? mimeType[1] : "html";

            console.log('response lang', contentTypeHeader, mimeType, responseLanguageValue);


            const responseStr = Buffer.from(response.body.buffer).toString();
            setSelectedTab(ConsoleTab.response);
            setResponse(responseStr);
            responseLanguageValue && setResponseLanguage(responseLanguageValue);
        }
        catch (error) {
            setSelectedTab(ConsoleTab.response);
            setRequestError(error.message);
        }
        finally {
            setSendingRequest(false);
        }
    }

    const sendFromProxy = async (request: HttpRequest) => {
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
            method: "POST",
            headers: [{ name: "X-Ms-Api-Name", value: apiName }],
            body: formData
        };

        const proxiedResponse = await httpClient.send<ResponsePackage>(proxiedRequest);
        const responsePackage = proxiedResponse.toObject();

        const responseBodyBuffer = responsePackage.body
            ? Buffer.from(responsePackage.body.data)
            : null;

        const response: any = {
            headers: responsePackage.headers,
            statusCode: responsePackage.statusCode,
            statusText: responsePackage.statusMessage,
            body: responseBodyBuffer,
            toText: () => responseBodyBuffer.toString("utf8")
        };

        return response;
    }

    const sendFromBrowser = async (request: HttpRequest) => {
        const response = await httpClient.send<any>(request);
        return response;
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

    const renderNode = (node: GraphQLTreeNode, isChild = false): JSX.Element[] => {
        return node.children()?.map((child: GraphQLTreeNode) => {
            if (!isChild && !child.label().includes(pattern)) return;
            
            return (
                <div key={child.id} className={`console-gql-node${isChild ? ' child-node' : ''}${child.isInputNode() ? ' input-node': ''}`}>
                    <Checkbox
                        label={child.label()}
                        checked={child.selected()}
                        onChange={() => child.toggle()}
                        required={child.isRequired()}
                    />
                    {(child.selected() && child.isInputNode())
                        ? child.isEnumType()
                            ? <Dropdown
                                value={(child as GraphQLInputTreeNode).inputValue()}
                                onOptionSelect={(_, data) => (child as GraphQLInputTreeNode).changeInputValue(data.optionValue)}
                            >
                                {(child as GraphQLInputTreeNode).options()?.map(option => (
                                    <Option key={option} value={option}>{option}</Option>
                                ))}
                            </Dropdown>
                            : (child.isScalarType() && (child as GraphQLInputTreeNode).inputValue)
                                && <Input
                                        value={(child as GraphQLInputTreeNode).inputValue()}
                                        onChange={(_, data) => (child as GraphQLInputTreeNode).changeInputValue(data.value)}
                                        autoComplete="off"
                                    />
                            
                        : <></>
                    }
                    {child.selected() && renderNode(child, true)}
                </div>
            );
        });
    }

    return (
        <OverlayDrawer
            open={isOpen}
            onOpenChange={(_, { open }) => setIsOpen(open)}
            position="end"
            size="full"
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
            <DrawerBody className={"console-gql-drawer"}>
                {working
                    ? <Spinner label="Loading..." labelPosition="below" size="small" />
                    : <>
                        <Stack horizontal verticalAlign="center" horizontalAlign="space-between" className={"console-gql-header"}>
                            <Body1>Query editor</Body1>
                            <Button
                                appearance="primary"
                                disabled={sendingRequest}
                                onClick={() => sendRequest()}
                            >
                                {sendingRequest ? "Sending" : "Send"}
                            </Button>
                        </Stack>
                        <Stack horizontal className={"console-gql-body"}>
                            <div className={"gql-explorer"}>
                                <SearchBox
                                    onChange={(_, { value }) => setPattern(value)}
                                    contentBefore={<SearchRegular className={"fui-search-icon"} />}
                                    placeholder={"Search operations"}
                                    aria-label={"Search operations"}
                                    className={"gql-search"}
                                />
                                <Accordion multiple collapsible defaultOpenItems={selectedGraphType}>
                                    {globalNodes.length > 0 &&
                                        globalNodes.map((node, index) => (
                                            <AccordionItem key={index} value={node.label()}>
                                                <AccordionHeader><Body1 className={"level0-node-label"}>{node.label()}</Body1></AccordionHeader>
                                                <AccordionPanel style={{ margin: 0 }}>{renderNode(node)}</AccordionPanel>
                                            </AccordionItem>
                                        ))
                                    }
                                </Accordion>
                            </div>
                            <div className={"gql-query"}>
                                <Stack>
                                    <div className={"gql-query-editor"}>
                                        <Editor
                                            height="500px"
                                            value={document}
                                            language="graphql"
                                            onMount={handleEditorWillMount}
                                            onChange={handleQueryEditorChange}
                                        />
                                    </div>
                                    <div>
                                        <TabList
                                            selectedValue={selectedTab}
                                            onTabSelect={(_, data) => setSelectedTab(data.value as string)}
                                            className={"gql-tabs"}
                                        >
                                            {(authorizationServers.length > 0 || api.subscriptionRequired) && <Tab value={ConsoleTab.auth}>Authorization</Tab>}
                                            <Tab value={ConsoleTab.parameters}>Parameters</Tab>
                                            <Tab value={ConsoleTab.headers}>Headers</Tab>
                                            <Tab value={ConsoleTab.queryVariables}>Query variables</Tab>
                                            <Tab value={ConsoleTab.response}>Response</Tab>
                                        </TabList>
                                        <div className={`gql-tab-content${selectedTab === ConsoleTab.queryVariables ? ' query-variables-tab': ''}`}>                                        
                                            {selectedTab === ConsoleTab.auth && (authorizationServers.length > 0 || api.subscriptionRequired) &&
                                                <ConsoleAuthorization
                                                    api={api}
                                                    headers={headers}
                                                    products={products}
                                                    subscriptionRequired={api.subscriptionRequired}
                                                    subscriptionKey={selectedSubscriptionKey}
                                                    authorizationServers={authorizationServers}
                                                    sessionManager={sessionManager}
                                                    oauthService={oauthService}
                                                    updateHeaders={updateHeaders}
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
                                            {selectedTab === ConsoleTab.queryVariables &&
                                                <Editor
                                                    value={queryVariables}
                                                    language="graphql"
                                                    onChange={handleVariablesEditorChange}
                                                />
                                            }
                                            {selectedTab === ConsoleTab.response &&
                                                (requestError
                                                    ? <MarkdownProcessor markdownToDisplay={requestError} />
                                                    : response && <SyntaxHighlighter children={response} language={responseLanguage} style={a11yLight} />
                                                )
                                            }
                                        </div>
                                    </div>
                                </Stack>
                            </div>
                        </Stack>
                    </>
                }
            </DrawerBody>
        </OverlayDrawer>
    );
}