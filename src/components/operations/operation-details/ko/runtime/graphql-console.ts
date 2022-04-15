import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as GraphQL from "graphql";
import * as monaco from "monaco-editor";
import loader from '@monaco-editor/loader';
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import template from "./graphql-console.html";
import graphqlExplorer from "./graphql-explorer.html";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { QueryEditorSettings, VariablesEditorSettings, ResponseSettings, GraphqlTypes, GraphqlCustomFieldNames, GraphqlMetaField, graphqlSubProtocol } from "./../../../../../constants";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { ApiService } from "../../../../../services/apiService";
import { GraphQLTreeNode, GraphQLOutputTreeNode, GraphQLInputTreeNode, getType } from "./graphql-utilities/graphql-node-models";
import { setupGraphQLQueryIntellisense } from "./graphql-utilities/graphqlUtils";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ResponsePackage } from "./responsePackage";
import { Utils } from "../../../../../utils";
import { GraphDocService } from "./graphql-documentation/graphql-doc-service";
import { LogItem, LogItemType, WebsocketClient } from "./websocketClient";
import * as _ from "lodash";
import { Logger } from "@paperbits/common/logging";

@Component({
    selector: "graphql-console",
    template: template,
    childTemplates: {
        graphqlExplorer: graphqlExplorer,
    }
})
export class GraphqlConsole {

    private operationNodes: {
        query: ko.Observable<GraphQLTreeNode>,
        mutation: ko.Observable<GraphQLTreeNode>,
        subscription: ko.Observable<GraphQLTreeNode>
    }

    private globalNodes: ko.ObservableArray<GraphQLTreeNode>

    private schema: string;
    public filter: ko.Observable<string>;

    private queryEditor: monaco.editor.IStandaloneCodeEditor;
    private variablesEditor: monaco.editor.IStandaloneCodeEditor;
    private responseEditor: monaco.editor.IStandaloneCodeEditor;

    private onContentChangeTimoutId: number = undefined;
    private editorUpdate: boolean = true;

    public readonly document: ko.Observable<string>;
    public readonly sendingRequest: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly collapsedHeaders: ko.Observable<boolean>;
    public readonly collapsedQuery: ko.Observable<boolean>;
    public readonly collapsedMutation: ko.Observable<boolean>;
    public readonly collapsedSubscription: ko.Observable<boolean>;
    public readonly headers: ko.ObservableArray<ConsoleHeader>;
    public readonly editorErrors: ko.ObservableArray<string>;
    public readonly variables: ko.Observable<string>;
    public readonly response: ko.Observable<string>;
    public readonly isContentValid: ko.Observable<boolean>;
    public backendUrl: string;

    public readonly isSubscriptionOperation: ko.Observable<boolean>;

    public readonly wsConnected: ko.Observable<boolean>;
    public readonly wsProcessing: ko.Observable<boolean>;
    public readonly displayWsConsole: ko.Observable<boolean>;
    private ws: WebsocketClient;
    public readonly wsLogItems: ko.ObservableArray<object>;


    constructor(
        private readonly routeHelper: RouteHelper,
        private readonly apiService: ApiService,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly graphDocService: GraphDocService,
        private readonly logger: Logger
    ) {
        this.working = ko.observable(true);
        this.collapsedHeaders = ko.observable(true);
        this.collapsedQuery = ko.observable(true);
        this.collapsedMutation = ko.observable(true);
        this.collapsedSubscription = ko.observable(true);
        this.editorErrors = ko.observableArray([]);
        this.api = ko.observable<Api>();
        this.sendingRequest = ko.observable(false);
        this.authorizationServer = ko.observable();
        this.headers = ko.observableArray();
        this.document = ko.observable();
        this.operationUrl = ko.observable();
        this.variables = ko.observable();
        this.response = ko.observable();
        this.filter = ko.observable("");
        this.isContentValid = ko.observable(true);
        this.useCorsProxy = ko.observable(true);

        this.operationNodes = {
            query: ko.observable(),
            mutation: ko.observable(),
            subscription: ko.observable()
        }
        this.globalNodes = ko.observableArray([]);

        this.isSubscriptionOperation = ko.observable(false);

        this.wsConnected = ko.observable(false);
        this.wsProcessing = ko.observable(false);
        this.displayWsConsole = ko.observable(false);
        this.wsLogItems = ko.observableArray([]);
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
        await this.loadingMonaco();
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

        let defaultHeader = new ConsoleHeader();
        defaultHeader.name("Content-Type");
        defaultHeader.value("application/json");
        this.headers.push(defaultHeader);

        const graphQLSchemas = await this.apiService.getSchemas(this.api());
        this.schema = graphQLSchemas.value.find(s => s.graphQLSchema)?.graphQLSchema;
        await this.buildTree(this.schema);
        this.availableOperations();
        this.selectByDefault();
        this.isSubscriptionOperation(this.document().trim().startsWith(GraphqlTypes.subscription));
        this.working(false);
    }

    public getApiReferenceUrl(): string {
        return this.routeHelper.getApiReferenceUrl(this.api().name);
    }

    private selectByDefault(): void {
        const type = this.graphDocService.currentSelected()[GraphqlCustomFieldNames.type]();
        this.operationNodes[type]().toggle(true);
        const name = this.graphDocService.currentSelected()['name'];

        for (let child of this.operationNodes[type]().children()) {
            if (child.label() === name) {
                child.toggle();
                break;
            }
        }
        this.generateDocument();
    }

    private onDocumentChange(document: string): void {
        if (this.editorUpdate) {
            this.queryEditor.setValue(document);
        }
        this.editorUpdate = true;
        this.isSubscriptionOperation(document.trim().startsWith(GraphqlTypes.subscription));
    }

    private onResponseChange(response: string): void {
        this.responseEditor.setValue(Utils.formatJson(response));
    }

    documentToTree() {
        try {
            const ast = GraphQL.parse(this.document(), { noLocation: true });
            for (let node of this.globalNodes()) {
                node?.clear();
                node?.toggle(true, false);
            }
            let curNode: GraphQLTreeNode;
            let variables = [];

            // Go through every node in a new generated parsed graphQL, associate the node with the created tree from init and toggle checkmark.
            GraphQL.visit(ast, {
                enter: node => {
                    if (node.kind === GraphQL.Kind.OPERATION_DEFINITION) {
                        variables = [];
                        curNode = this.globalNodes().find(mainNode => mainNode.label() == node.operation);
                    } else if (node.kind === GraphQL.Kind.FIELD || node.kind === GraphQL.Kind.ARGUMENT
                        || node.kind === GraphQL.Kind.OBJECT_FIELD || node.kind === GraphQL.Kind.INLINE_FRAGMENT) {
                        let targetNode: GraphQLTreeNode;
                        if (node.kind === GraphQL.Kind.FIELD) {
                            targetNode = curNode.children().find(n => !n.isInputNode() && n.label() === node.name.value);
                        } else if (node.kind === GraphQL.Kind.INLINE_FRAGMENT) {
                            targetNode = curNode.children().find(n => !n.isInputNode() && n.label() === node.typeCondition.name.value);
                        } else {
                            let inputNode = <GraphQLInputTreeNode>curNode.children().find(n => n.isInputNode() && n.label() === node.name.value);
                            if (node.value.kind === GraphQL.Kind.STRING) {
                                inputNode.inputValue(`"${node.value.value}"`);
                            } else if (node.value.kind === GraphQL.Kind.BOOLEAN || node.value.kind === GraphQL.Kind.INT
                                || node.value.kind === GraphQL.Kind.FLOAT || node.value.kind === GraphQL.Kind.ENUM) {
                                inputNode.inputValue(`${node.value.value}`);
                            } else if (node.value.kind === GraphQL.Kind.VARIABLE) {
                                inputNode.inputValue(`$${node.value.name.value}`);
                            }
                            targetNode = inputNode;
                        }
                        if (targetNode) {
                            curNode = targetNode;
                            curNode.toggle(true, false);
                        }
                    } else if (node.kind === GraphQL.Kind.VARIABLE_DEFINITION &&
                        (node.type.kind === GraphQL.Kind.NAMED_TYPE || node.type.kind === GraphQL.Kind.NON_NULL_TYPE)) {
                        let typeString;
                        if (node.type.kind === GraphQL.Kind.NON_NULL_TYPE && node.type.type.kind === GraphQL.Kind.NAMED_TYPE) {
                            typeString = `${node.type.type.name.value}!`;
                        } else if (node.type.kind === GraphQL.Kind.NAMED_TYPE) {
                            typeString = node.type.name.value;
                        }
                        variables.push({
                            name: node.variable.name.value,
                            type: typeString
                        });
                    }
                },
                leave: node => {
                    if (curNode && (node.kind === GraphQL.Kind.FIELD || node.kind === GraphQL.Kind.ARGUMENT
                        || node.kind === GraphQL.Kind.OBJECT_FIELD || node.kind === GraphQL.Kind.INLINE_FRAGMENT
                        || node.kind === GraphQL.Kind.OPERATION_DEFINITION)) {
                        if (node.kind === GraphQL.Kind.OPERATION_DEFINITION) {
                            (<GraphQLOutputTreeNode>curNode).variables = variables;
                        }
                        if (!(node.kind === GraphQL.Kind.FIELD && node.name.value === GraphqlMetaField.typename))
                            curNode = curNode.parent();
                    }
                }
            });
        } catch (err) {
            // Do nothing here as the doc is invalidated
            return;
        }
    }

    private tryParseGraphQLSchema(document: string): void {
        try {
            GraphQL.parse(document);
        }
        catch (error) {
            this.isContentValid(false);
        }
    }

    public removeHeader(header: ConsoleHeader): void {
        this.headers.remove(header);
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
        this.editorValidations();
        if (this.editorErrors().length > 0) {
            return;
        }
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
            return;
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
        loader.config({ paths: { vs: "/assets/monaco-editor/vs" } });
        loader.init().then(monaco => {
            this.initEditor(VariablesEditorSettings, this.variables);
            this.initEditor(ResponseSettings, this.response);
            this.initEditor(QueryEditorSettings, this.document);
        });
    }

    private initEditor(editorSettings, editorValue: ko.Observable<string>): void {

        if (editorSettings.id === QueryEditorSettings.id) {
            setupGraphQLQueryIntellisense(this.schema);
        }

        let formattedEditorValue = editorValue();

        if (editorSettings.id === ResponseSettings.id) {
            formattedEditorValue = Utils.formatJson(formattedEditorValue);
        }

        const defaultSettings = {
            value: formattedEditorValue || "",
            contextmenu: false,
            lineHeight: 17,
            automaticLayout: true,
            minimap: {
                enabled: false
            }
        };

        let settings = { ...defaultSettings, ...editorSettings.config }

        this[editorSettings.id] = (<any>window).monaco.editor.create(document.getElementById(editorSettings.id), settings);

        this[editorSettings.id].onDidChangeModelContent((e) => {
            if (!e.isFlush) {
                const value = this[editorSettings.id].getValue();
                if (editorSettings.id === QueryEditorSettings.id) {
                    this.isContentValid(true);
                    clearTimeout(this.onContentChangeTimoutId);
                    this.onContentChangeTimoutId = window.setTimeout(async () => {
                        this.tryParseGraphQLSchema(value);
                        if (this.isContentValid()) {
                            this.editorUpdate = false;
                            this.document(value);
                        }
                        this.documentToTree();
                    }, 500)
                }
                if (editorSettings.id === VariablesEditorSettings.id) {
                    this.variables(value);
                }
            }
        });
    }

    private buildTree(content: string): void {
        const schema = GraphQL.buildSchema(content);

        this.operationNodes.query(new GraphQLOutputTreeNode(GraphqlTypes.query, <GraphQL.GraphQLField<any, any>>{
            type: schema.getQueryType(),
            args: []
        }, () => this.generateDocument(), null));

        this.operationNodes.mutation(new GraphQLOutputTreeNode(GraphqlTypes.mutation, <GraphQL.GraphQLField<any, any>>{
            type: schema.getMutationType(),
            args: []
        }, () => this.generateDocument(), null));

        this.operationNodes.subscription(new GraphQLOutputTreeNode(GraphqlTypes.subscription, <GraphQL.GraphQLField<any, any>>{
            type: schema.getSubscriptionType(),
            args: []
        }, () => this.generateDocument(), null));
    }

    public generateDocument() {
        const document = `${this.createFieldStringFromNodes(this.globalNodes(), 0)}`;
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
            if (this.checkingGeneration(node)) {
                const parentType = getType(node.parent()?.data?.type);
                const nodeName = (parentType instanceof GraphQL.GraphQLUnionType) ? `... on ${node.label()}` : node.label();
                if (level === 0) {
                    selectedNodes.push(nodeName + this.createVariableString(<GraphQLOutputTreeNode>node) + this.createFieldStringFromNodes(outputNodes, level + 1));
                } else {
                    selectedNodes.push(nodeName + this.createArgumentStringFromNode(inputNodes, true) + this.createFieldStringFromNodes(outputNodes, level + 1));
                }
            }
        }
        selectedNodes = selectedNodes.map(node => "\t".repeat(level) + node);
        let result: string;
        if (selectedNodes.length === 0) {
            result = "";
        } else {
            if (level === 0) {
                result = selectedNodes.join("\n\n");
            } else {
                result = ` {\n${selectedNodes.join("\n")}\n${"\t".repeat(level - 1)}}`
            }
        }
        return result;
    }



    private checkingGeneration(node: GraphQLTreeNode): boolean {
        const allOperations = <string[]>[GraphqlTypes.query, GraphqlTypes.mutation, GraphqlTypes.subscription];
        const isOperation = allOperations.includes(node.label());
        if ((node.selected() && !isOperation) || (node.selected() && isOperation && node.hasActiveChild())) {   
            return true;
        }
        return false;
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

    public gqlFieldName(name: string, isRequired: boolean, isInputNode: boolean): string {
        let gqlFieldName = name += (isRequired && isInputNode) ? '*' : '';
        gqlFieldName = gqlFieldName += (isInputNode) ? ':' : '';
        return gqlFieldName;
    }

    public collapse(collapsible: string): void {
        this[collapsible](!this[collapsible]());
    }

    public collapsedType(type: string): boolean {
        const varName = 'collapsed' + type;
        return this[varName]();
    }

    private availableOperations(): void {
        _.forEach(this.graphDocService.availableTypes(), (type) => {
            const node = this.operationNodes[this.graphDocService.typeIndexer()[type]]();
            node.toggle(true);
            this.globalNodes.push(node);
        })
    }

    public getOperationNode(type: string) {
        return this.operationNodes[this.graphDocService.typeIndexer()[type]]();
    }

    public closeGraphqlConsole(): void {
        this.closeWsConnection();
        (<any>window).monaco.editor.getModels().forEach(model => model.dispose());
    }

    public async closeWsConnection(): Promise<void> {
        if (this.wsConnected()) {
            this.wsConnected(false);
            this.ws?.disconnect();
        }
    }

    public async closeWs(): Promise<void> {
        this.closeWsConnection();
        this.displayWsConsole(false);
    }

    public async wsConnect(): Promise<void> {
        this.editorValidations();
        if (this.wsConnected() || this.editorErrors().length > 0) {
            return;
        }

        this.wsProcessing(true);
        this.displayWsConsole(true);

        let url = this.operationUrl();

        if (url.startsWith("https://")) {
            url = "wss://" + url.substring(8);
        } else if (url.startsWith("http://")) {
            url = "ws://" + url.substring(7)
        }

        this.initWebSocket();
        this.ws.connect(url, graphqlSubProtocol);
    }

    public clearWsLogs(): void {
        this.wsLogItems([]);
    }

    private initWebSocket(): void {
        this.ws = new WebsocketClient();
        this.ws.onOpen = () => {
            this.wsProcessing(false);
            this.wsConnected(true);
            this.ws.send(JSON.stringify({
                type: "connection_init",
                payload: {}
            }));
            this.ws.send(JSON.stringify({
                type: "subscribe",
                id: "1",
                payload: {
                    query: this.document(),
                    variables: this.variables() && this.variables().length > 0 ? JSON.parse(this.variables()) : null
                }
            }, null, 2));
        };
        this.ws.onLogItem = (data: LogItem) => {
            if (!data) {
                return;
            }
            if (data.logType === LogItemType.GetData) {
                try {
                    let json = JSON.parse(data.logData);
                    if (json["type"] == "next" && "payload" in json) {
                        data.logData = JSON.stringify(json["payload"], null, 2);
                        this.wsLogItems.unshift(data);
                    }
                } catch (error) {
                    this.logger.trackError(error);
                }
            }
            else if (data.logType === LogItemType.SendData) {
                try {
                    let json = JSON.parse(data.logData);
                    if (json["type"] == "subscribe" && "payload" in json) {
                        data.logData = JSON.stringify(json["payload"], null, 2);
                        this.wsLogItems.unshift(data);
                    }
                } catch (error) {
                    this.logger.trackError(error);
                }
            }
            else if (data.logType === LogItemType.Connection) {
                if (data.logData.includes('Disconnected')) {
                    return;
                }
                if (data.logData.includes('Disconnecting from')) {
                    data.logData = data.logData.replace('Disconnecting', 'Disconnected');
                }
                this.wsLogItems.unshift(data);
            }
            else {
                this.wsLogItems.unshift(data);
            }
        };
        this.ws.onError = (error: string) => {
            this.wsProcessing(false);
            this.wsConnected(false);
        }
    }

    private editorValidations(): void {
        this.editorErrors([]);
        const markers = (<any>window).monaco.editor.getModelMarkers({});
        if (!!markers.find(m => m.severity >= 5 && m.owner == "graphqlQuery")) {
            this.editorErrors.push("Syntax error in 'Query editor'");
        }
        try {
            JSON.parse(this.variables() || "{}");
        } catch {
            this.editorErrors.push("Cannot parse JSON in 'Query variables'");
        }
    }

    public hasErrorEditors(): boolean {
        return this.editorErrors().length > 0;
    }

    public canRestartSubscription(): boolean {
        return this.wsConnected() && this.isSubscriptionOperation();
    }

    public restartSubscription(): void {
        this.closeWsConnection();
        this.wsConnect();
    }

}