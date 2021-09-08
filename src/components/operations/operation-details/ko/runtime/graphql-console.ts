import * as ko from "knockout";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import template from "./graphql-console.html";
import { Api } from "../../../../../models/api";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { GrantTypes, QueryEditorSettings, VariablesEditorSettings, ResponseSettings } from "./../../../../../constants";
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
import { parse as parseGraphQLSchema } from "graphql";
import * as _ from "lodash";
import * as monaco from "monaco-editor";
import { MonacoEditorLoader } from "./editor/monaco-loader";


const oauthSessionKey = "oauthSession";


@Component({
    selector: "graphql-console",
    template: template
})
export class GraphqlConsole {
    private queryEditor: monaco.editor.IStandaloneCodeEditor;
    private variablesEditor: monaco.editor.IStandaloneCodeEditor;
    private responseEditor: monaco.editor.IStandaloneCodeEditor;
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

    constructor(
        private readonly routeHelper: RouteHelper,
        private readonly oauthService: OAuthService,
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
        private readonly sessionManager: SessionManager,
        private monacoEditorLoader: MonacoEditorLoader,
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
    }

    @Param()
    public api: ko.Observable<Api>;

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetConsole();
        this.api.subscribe(this.resetConsole);
        await this.loadingMonaco();
        this.selectedSubscriptionKey.subscribe(this.applySubscriptionKey.bind(this));
        this.selectedGrantType.subscribe(this.onGrantTypeChange);
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

        try {
            //TODO
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

    public loadingMonaco() {
        this.monacoEditorLoader.waitForMonaco().then(() => {
            this.initEditor(QueryEditorSettings);
            this.initEditor(VariablesEditorSettings);
            this.initEditor(ResponseSettings);
        });
    }

    private initEditor(editorSettings): void {

        const defaultSettings = {
            value: "",
            readOnly: false,
            contextmenu: false,
            lineHeight: 17,
            automaticLayout: true,
            ariaLabel: "test",
            minimap: {
                enabled: false
            }
        };

        const settings = { ...defaultSettings, ...editorSettings.config }

        this[editorSettings.id] = (<any>window).monaco.editor.create(document.getElementById(editorSettings.id), settings);

        //this.schemaValidator = new SchemaValidator();

        // const validateContent = new Subject<string>();
        // this.parsingContentError = validateContent.debounceTime(750);
        // this.parsingContentError.subscribe(() => {
        //     this.tryParseContent();
        //     this.onContentParsingErrors.emit(this.contentParseErrors);
        // });

        this[editorSettings.id].onDidChangeModelContent(() => {
            //this.content = this.editor.getValue();

            console.log("this.[editorSettings.id].getValue()")
            console.log(this[editorSettings.id].getValue())
            // clearTimeout(this.onContentChangeTimoutId);
            // this.onContentChangeTimoutId = window.setTimeout(() => {
            //     this.onContentChange.emit(this.content);
            //     validateContent.next();
            // }, 500)
        });

        // if (this.keyPathTrace) {
        //     this.editor.onDidChangeCursorPosition(() => {
        //         const position = this.editor.getPosition();
        //         const offset = this.editor.getModel().getOffsetAt(position);
        //         const keyPaths = Utils.getKeyPathFromJsonStringIndex(this.content, offset);
                
        //         this.swaggerPaths.emit(keyPaths);
        //     });
        // }
        //this.onEditorReady.emit(this);

        //this.onHighContrastChanged(this.snippetService.getCurrentHighContrast());
        //this.snippetService.highContrastChange().subscribe(this.onHighContrastChanged.bind(this));
    }
}