import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as GraphQL from "graphql";
import * as _ from "lodash";
import * as monaco from "monaco-editor";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import template from "./graphql-console.html";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { GrantTypes, QueryEditorSettings, VariablesEditorSettings, ResponseSettings, GraphqlOperationTypes, SettingNames } from "./../../../../../constants";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { OAuthService } from "../../../../../services/oauthService";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { OAuthSession, StoredCredentials } from "./oauthSession";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { UnauthorizedError } from "../../../../../errors/unauthorizedError";
import { Product } from "../../../../../models/product";
import { UsersService } from "../../../../../services/usersService";
import { ApiService } from "../../../../../services/apiService";
import { ProductService } from "../../../../../services/productService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { MonacoEditorLoader } from "./graphql-utilities/monaco-loader";
import { GraphQLTreeNode, GraphQLOutputTreeNode, GraphQLInputTreeNode } from "./graphql-utilities/graphql-node-models";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ResponsePackage } from "./responsePackage";
import { Utils } from "../../../../../utils";


const oauthSessionKey = "oauthSession";

function getType(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType) {
    while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
        type = type.ofType;
    }
    return type;
}


@Component({
    selector: "graphql-console",
    template: template
})
export class GraphqlConsole {

    private queryNode: ko.Observable<GraphQLTreeNode>;
    private mutationNode: ko.Observable<GraphQLTreeNode>;
    private subscriptionNode: ko.Observable<GraphQLTreeNode>;

    public node: ko.Observable<GraphQLTreeNode>;
    public queryType: ko.Observable<string>;
    public filter: ko.Observable<string>;

    private queryEditor: monaco.editor.IStandaloneCodeEditor;
    private variablesEditor: monaco.editor.IStandaloneCodeEditor;
    private responseEditor: monaco.editor.IStandaloneCodeEditor;

    public readonly document: ko.Observable<string>;
    public readonly sendingRequest: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly subscriptionKeyRequired: ko.Observable<boolean>;
    public readonly selectedGrantType: ko.Observable<string>;
    public readonly authenticated: ko.Observable<boolean>;
    public readonly headers: ko.ObservableArray<ConsoleHeader>;
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly products: ko.Observable<Product[]>;
    public readonly selectedSubscriptionKey: ko.Observable<string>;
    public readonly requestError: ko.Observable<string>;
    public readonly authorizationError: ko.Observable<string>;
    public readonly variables: ko.Observable<string>;
    public readonly response: ko.Observable<string>;
    public backendUrl: string;

    constructor(
        private readonly routeHelper: RouteHelper,
        private readonly oauthService: OAuthService,
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
        private readonly sessionManager: SessionManager,
        private monacoEditorLoader: MonacoEditorLoader,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.working = ko.observable(true);
        this.requestError = ko.observable();
        this.api = ko.observable<Api>();
        this.sendingRequest = ko.observable(false);
        this.authorizationServer = ko.observable();
        this.subscriptionKeyRequired = ko.observable();
        this.selectedGrantType = ko.observable();
        this.authenticated = ko.observable(false);
        this.headers = ko.observableArray();
        this.username = ko.observable();
        this.password = ko.observable();
        this.authorizationError = ko.observable();
        this.selectedSubscriptionKey = ko.observable();
        this.products = ko.observable();
        this.queryType = ko.observable(GraphqlOperationTypes.query);
        this.document = ko.observable();
        this.operationUrl = ko.observable();
        this.variables = ko.observable();
        this.response = ko.observable();
        this.filter = ko.observable("");
        this.useCorsProxy = ko.observable(true);

        this.queryNode = ko.observable();
        this.mutationNode = ko.observable();
        this.subscriptionNode = ko.observable();
        this.node = ko.observable();
    }

    @Param()
    public api: ko.Observable<Api>;

    @Param()
    public operationUrl: ko.Observable<string>;

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;

    @Param()
    public useCorsProxy: ko.Observable<boolean>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetConsole();
        this.api.subscribe(this.resetConsole);
        await this.loadingMonaco();
        this.selectedSubscriptionKey.subscribe(this.applySubscriptionKey.bind(this));
        this.selectedGrantType.subscribe(this.onGrantTypeChange);
        this.queryType.subscribe(this.onQueryTypeChange);
        this.document.subscribe(this.onDocumentChange);
        this.response.subscribe(this.onResponseChange);
        this.backendUrl = await this.settingsProvider.getSetting<string>("backendUrl");
    }

    private async resetConsole(): Promise<void> {
        const selectedApi = this.api();

        if (!selectedApi) {
            return;
        }

        this.working(true);
        this.sendingRequest(false);
        this.selectedSubscriptionKey(null);
        this.subscriptionKeyRequired(!!selectedApi.subscriptionRequired);

        if (selectedApi.subscriptionRequired) {
            await this.loadSubscriptionKeys();
        }

        let defaultHeader = new ConsoleHeader();
        defaultHeader.name("Content-Type");
        defaultHeader.value("application/json");
        this.headers.push(defaultHeader);

        const graphQLSchemas = await this.apiService.getSchemas(this.api());
        const schema = graphQLSchemas.value.find(s => s.graphQLSchema);
        await this.buildTree(schema.graphQLSchema);
        this.node(this.queryNode());
        this.node().toggle(true);
        this.generateDocument();
        this.working(false);
    }

    public getApiReferenceUrl(): string {
        return this.routeHelper.getApiReferenceUrl(this.api().name);
    }

    private async onGrantTypeChange(grantType: string): Promise<void> {
        await this.clearStoredCredentials();

        if (!grantType || grantType === GrantTypes.password) {
            return;
        }

        await this.authenticateOAuth(grantType);
    }

    private async onQueryTypeChange(queryType: string): Promise<void> {
        switch (queryType) {
            case "query":
                this.node(this.queryNode());
                break;
            case "mutation":
                this.node(this.mutationNode());
                break;
            case "subscription":
                this.node(this.subscriptionNode());
                break;
            default:
                break;
        }
        this.node().toggle(true);
    }

    private onDocumentChange(document: string): void {
        this.queryEditor.setValue(document);
        //this.documentToTree();
    }

    private onResponseChange(response: string): void {
        this.responseEditor.setValue(Utils.formatJson(response));
    }

    documentToTree() {
        try {
            const ast = GraphQL.parse(this.document(), { noLocation: true });
            for (let child of this.node().children()) {
                child.clear();
            }
            let curNode = this.node;
            let variables = [];

            // Go through every node in a new generated parsed graphQL, associate the node with the created tree from init and toggle checkmark.
            GraphQL.visit(ast, {
                enter(node) {
                    if (node.kind === "Field" || node.kind === "Argument" || node.kind === "ObjectField") {
                        let targetNode: GraphQLTreeNode;
                        if (node.kind === "Field") {
                            targetNode = curNode().children().find(n => !n.isInputNode() && n.label() === node.name.value);
                        } else {
                            let inputNode = <GraphQLInputTreeNode>curNode().children().find(n => n.isInputNode() && n.label() === node.name.value);
                            if (node.kind === "Argument") {
                                if (node.value.kind === "StringValue") {
                                    inputNode.inputValue(`"${node.value.value}"`);
                                } else if (node.value.kind === "BooleanValue" || node.value.kind === "IntValue" || node.value.kind === "FloatValue" || node.value.kind === "EnumValue") {
                                    inputNode.inputValue(`${node.value.value}`);
                                } else if (node.value.kind === "Variable") {
                                    inputNode.inputValue(`$${node.value.name.value}`);
                                }
                            }
                            targetNode = inputNode;
                        }
                        if (targetNode) {
                            curNode(targetNode);
                            curNode().toggle(true, false);
                        }
                    } else if (node.kind === "VariableDefinition" && (node.type.kind === "NamedType" || node.type.kind === "NonNullType")) {
                        let typeString;
                        if (node.type.kind === "NonNullType" && node.type.type.kind === "NamedType") {
                            typeString = `${node.type.type.name.value}!`;
                        } else if (node.type.kind === "NamedType") {
                            typeString = node.type.name.value;
                        }
                        variables.push({
                            name: node.variable.name.value,
                            type: typeString
                        });
                    }
                },
                leave(node) {
                    if (curNode && node.kind === "Field" || node.kind === "Argument" || node.kind === "ObjectField") {
                        curNode(curNode().parent());
                    }
                }
            });
            (<GraphQLOutputTreeNode>this.node()).variables = variables;
        } catch (err) {
            // Do nothing here as the doc is invalidated
        }
    }

    /**
     * Initiates specified authentication flow.
     * @param grantType OAuth grant type, e.g. "implicit" or "authorization_code".
     */
    public async authenticateOAuth(grantType: string): Promise<void> {
        const api = this.api();
        const authorizationServer = this.authorizationServer();
        const scopeOverride = api.authenticationSettings?.oAuth2?.scope;
        const serverName = authorizationServer.name;

        if (scopeOverride) {
            authorizationServer.scopes = [scopeOverride];
        }

        const accessToken = await this.oauthService.authenticate(grantType, authorizationServer);
        await this.setStoredCredentials(serverName, scopeOverride, grantType, accessToken);

        this.setAuthorizationHeader(accessToken);
    }

    private async clearStoredCredentials(): Promise<void> {
        await this.sessionManager.removeItem(oauthSessionKey);
        this.removeAuthorizationHeader();
    }

    private async setStoredCredentials(serverName: string, scopeOverride: string, grantType: string, accessToken: string): Promise<void> {
        const oauthSession = await this.sessionManager.getItem<OAuthSession>(oauthSessionKey) || {};
        const recordKey = this.getSessionRecordKey(serverName, scopeOverride);

        oauthSession[recordKey] = {
            grantType: grantType,
            accessToken: accessToken
        };

        await this.sessionManager.setItem<object>(oauthSessionKey, oauthSession);
    }

    private setAuthorizationHeader(accessToken: string): void {
        this.removeAuthorizationHeader();

        const keyHeader = new ConsoleHeader();
        keyHeader.name(KnownHttpHeaders.Authorization);
        keyHeader.value(accessToken);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue = "password";
        keyHeader.type = "string";
        keyHeader.required = true;

        this.headers.push(keyHeader);

        this.authenticated(true);
    }

    private removeAuthorizationHeader(): void {
        const authorizationHeader = this.findHeader(KnownHttpHeaders.Authorization);
        this.removeHeader(authorizationHeader);
        this.authenticated(false);
    }

    private getSessionRecordKey(authorizationServerName: string, scopeOverride: string): string {
        let recordKey = authorizationServerName;

        if (scopeOverride) {
            recordKey += `-${scopeOverride}`;
        }

        return recordKey;
    }

    private findHeader(name: string): ConsoleHeader {
        const searchName = name.toLocaleLowerCase();

        return this.headers()
            .find(x => x.name()?.toLocaleLowerCase() === searchName);
    }

    public removeHeader(header: ConsoleHeader): void {
        this.headers.remove(header);
    }

    public async authenticateOAuthWithPassword(): Promise<void> {
        try {
            this.authorizationError(null);

            const api = this.api();
            const authorizationServer = this.authorizationServer();
            const scopeOverride = api.authenticationSettings?.oAuth2?.scope;
            const serverName = authorizationServer.name;

            if (scopeOverride) {
                authorizationServer.scopes = [scopeOverride];
            }

            const accessToken = await this.oauthService.authenticatePassword(this.username(), this.password(), authorizationServer);
            await this.setStoredCredentials(serverName, scopeOverride, GrantTypes.password, accessToken);

            this.setAuthorizationHeader(accessToken);
        }
        catch (error) {
            if (error instanceof UnauthorizedError) {
                this.authorizationError(error.message);
                return;
            }

            this.authorizationError("Oops, something went wrong. Try again later.");
        }
    }

    private async loadSubscriptionKeys(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            return;
        }

        const pageOfProducts = await this.apiService.getAllApiProducts(this.api().id);
        const products = pageOfProducts && pageOfProducts.value ? pageOfProducts.value : [];
        const pageOfSubscriptions = await this.productService.getSubscriptions(userId);
        const subscriptions = pageOfSubscriptions.value.filter(subscription => subscription.state === SubscriptionState.active);
        const availableProducts = [];

        products.forEach(product => {
            const keys = [];

            subscriptions.forEach(subscription => {
                if (!this.productService.isScopeSuitable(subscription.scope, this.api().name, product.name)) {
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

        this.products(availableProducts);

        if (availableProducts.length > 0) {
            const subscriptionKey = availableProducts[0].subscriptionKeys[0].value;
            this.selectedSubscriptionKey(subscriptionKey);
            this.applySubscriptionKey(subscriptionKey);
        }
    }

    private applySubscriptionKey(subscriptionKey: string): void {
        this.setSubscriptionKeyHeader(subscriptionKey);
    }

    private setSubscriptionKeyHeader(subscriptionKey: string): void {
        this.removeSubscriptionKeyHeader();

        if (!subscriptionKey) {
            return;
        }

        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();

        const keyHeader = new ConsoleHeader();
        keyHeader.name(subscriptionKeyHeaderName);
        keyHeader.value(subscriptionKey);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue = "password";
        keyHeader.type = "string";
        keyHeader.required = true;

        this.headers.push(keyHeader);
    }

    private removeSubscriptionKeyHeader(): void {
        const subscriptionKeyHeader = this.getSubscriptionKeyHeader();
        this.removeHeader(subscriptionKeyHeader);
    }

    private getSubscriptionKeyHeaderName(): string {
        let subscriptionKeyHeaderName: string = KnownHttpHeaders.OcpApimSubscriptionKey;

        if (this.api().subscriptionKeyParameterNames && this.api().subscriptionKeyParameterNames.header) {
            subscriptionKeyHeaderName = this.api().subscriptionKeyParameterNames.header;
        }

        return subscriptionKeyHeaderName;
    }

    private getSubscriptionKeyHeader(): ConsoleHeader {
        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();
        return this.findHeader(subscriptionKeyHeaderName);
    }

    public addHeader(): void {
        this.headers.push(new ConsoleHeader());
    }

    public async validateAndSendRequest(): Promise<void> {
        const headers = this.headers();
        const parameters = [].concat(headers);
        const validationGroup = validation.group(parameters.map(x => x.value), { live: true });
        const clientErrors = validationGroup();

        if (clientErrors.length > 0) {
            validationGroup.showAllMessages();
            return;
        }

        this.sendRequest();
    }

    private async sendRequest(): Promise<void> {
        this.requestError(null);
        this.sendingRequest(true);

        let payload: string;
        payload = JSON.stringify({
            query: this.document(),
            variables: this.variables() && this.variables().length > 0 ? JSON.parse(this.variables()) : null
        })

        const request: HttpRequest = {
            url: this.operationUrl(),
            method: "POST",
            headers: this.addSystemHeaders(),
            body: payload
        };

        try {
            let response;
            if (this.useCorsProxy()) {
                response = await this.sendFromProxy(request);
            }
            else {
                response = await this.sendFromBrowser(request);
            }
            const responseStr = Buffer.from(response.body.buffer).toString();
            this.response(responseStr);
        }
        catch (error) {
            if (error.code && error.code === "RequestError") {
                this.requestError(`Since the browser initiates the request, it requires Cross-Origin Resource Sharing (CORS) enabled on the server. <a href="https://aka.ms/AA4e482" target="_blank">Learn more</a>`);
            }
        }
        finally {
            this.sendingRequest(false);
        }
    }

    private addSystemHeaders() {
        return this.headers().map(x => { return { name: x.name(), value: x.value() ?? "" }; }).filter(x => !!x.name && !!x.value);
    }

    public async sendFromProxy<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (request.body) {
            request.body = Buffer.from(request.body);
        }

        const formData = new FormData();
        const requestPackage = new Blob([JSON.stringify(request)], { type: KnownMimeTypes.Json });
        formData.append("requestPackage", requestPackage);

        const baseProxyUrl = this.backendUrl || "";
        const apiName = this.api().name;

        const proxiedRequest: HttpRequest = {
            url: `${baseProxyUrl}/send`,
            method: "POST",
            headers: [{ name: "X-Ms-Api-Name", value: apiName }],
            body: formData
        };

        const proxiedResponse = await this.httpClient.send<ResponsePackage>(proxiedRequest);
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

    public async sendFromBrowser<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        const response = await this.httpClient.send<any>(request);
        return response;
    }

    public loadingMonaco() {
        this.monacoEditorLoader.waitForMonaco().then(() => {
            this.initEditor(QueryEditorSettings, this.document);
            this.initEditor(VariablesEditorSettings, this.variables);
            this.initEditor(ResponseSettings, this.response);
        });
    }

    private initEditor(editorSettings, value: ko.Observable<string>): void {

        const defaultSettings = {
            value: value() || "",
            contextmenu: false,
            lineHeight: 17,
            automaticLayout: true,
            ariaLabel: "test",
            minimap: {
                enabled: false
            }
        };

        let settings = { ...defaultSettings, ...editorSettings.config }

        this[editorSettings.id] = (<any>window).monaco.editor.create(document.getElementById(editorSettings.id), settings);

        this[editorSettings.id].onDidChangeModelContent(() => {
            const value = this[editorSettings.id].getValue();
            if (editorSettings.id === QueryEditorSettings.id) {
                this.document(value);
                //this.documentToTree();
            }
            if (editorSettings.id === VariablesEditorSettings.id) {
                this.variables(value);
            }
            // clearTimeout(this.onContentChangeTimoutId);
            // this.onContentChangeTimoutId = window.setTimeout(() => {
            //     this.onContentChange.emit(this.content);
            //     validateContent.next();
            // }, 500)
        });
    }

    private buildTree(content: string): void {
        const schema = GraphQL.buildSchema(content);

        this.queryNode(new GraphQLOutputTreeNode(GraphqlOperationTypes.query, <GraphQL.GraphQLField<any, any>>{
            type: schema.getQueryType(),
            args: []
        }, () => this.generateDocument(), null));

        this.mutationNode(new GraphQLOutputTreeNode(GraphqlOperationTypes.mutation, <GraphQL.GraphQLField<any, any>>{
            type: schema.getMutationType(),
            args: []
        }, () => this.generateDocument(), null));

        this.subscriptionNode(new GraphQLOutputTreeNode(GraphqlOperationTypes.subscription, <GraphQL.GraphQLField<any, any>>{
            type: schema.getSubscriptionType(),
            args: []
        }, () => this.generateDocument(), null));
    }

    public generateDocument() {
        const document = `${this.createFieldStringFromNodes([this.node()], 0)}`;
        this.document(document);
    }

    /**
     * 
     * @param nodes list of root nodes to generate from
     * @param level level for indent
     * @returns string of generated node, for example:
     * {
     *    dragon
     * }
     */
    private createFieldStringFromNodes(nodes: GraphQLTreeNode[], level: number): string {
        let selectedNodes: string[] = [];
        for (let node of nodes) {
            let inputNodes: GraphQLInputTreeNode[] = []
            let outputNodes: GraphQLTreeNode[] = [];
            for (let child of node.children()) {
                if (child instanceof GraphQLInputTreeNode) {
                    inputNodes.push(child);
                } else {
                    outputNodes.push(child);
                }
            }
            if (node.selected()) {
                if (level === 0) {
                    selectedNodes.push(node.label() + this.createVariableString(<GraphQLOutputTreeNode>node) + this.createFieldStringFromNodes(outputNodes, level + 1));
                } else {
                    selectedNodes.push(node.label() + this.createArgumentStringFromNode(inputNodes, true) + this.createFieldStringFromNodes(outputNodes, level + 1));
                }
            }
        }
        selectedNodes = selectedNodes.map(node => "\t".repeat(level) + node);
        let result: string;
        if (selectedNodes.length === 0) {
            result = "";
        } else {
            if (level === 0) {
                result = selectedNodes[0];
            } else {
                result = ` {\n${selectedNodes.join("\n")}\n${"\t".repeat(level - 1)}}`
            }
        }
        return result;
    }

    /**
    * 
    * @param node root node, either query, mutation, or subscription
    * @returns list of variable as string to parse in document. For example, ($lim: Int!)
    */
    private createVariableString(node: GraphQLOutputTreeNode): string {
        if (node.variables.length > 0) {
            return "(" + node.variables.map(v => `$${v.name}: ${v.type}`).join(", ") + ")";
        }
        return "";
    }

    /**
     * Example: (limit: 10)
     * @param nodes list of root nodes to generate from
     * @param firstLevel true if this is the first level of object argument ({a: {b: 2}})
     * @returns string of argument of the declaration. For example, (a : 1)
     */
    private createArgumentStringFromNode(nodes: GraphQLInputTreeNode[], firstLevel: boolean): string {
        let selectedNodes: string[] = [];
        for (let node of nodes) {
            if (node.selected()) {
                let type = getType(node.data.type);
                if (node.isScalarType() || node.isEnumType()) {
                    selectedNodes.push(`${node.label()}: ${node.inputValue()}`);
                } else if (type instanceof GraphQL.GraphQLInputObjectType) {
                    selectedNodes.push(`${node.label()}: { ${this.createArgumentStringFromNode(node.children(), false)} }`)
                }
            }
        }
        return selectedNodes.length > 0 ? (firstLevel ? `(${selectedNodes.join(", ")})` : selectedNodes.join(", ")) : "";
    }

    public operationName(name: string, isRequired: boolean, isInputNode: boolean): string {
        let operationName = name += (isRequired) ? '*' : '';
        operationName = operationName += (isInputNode) ? ':' : '';
        return operationName;
    }

}