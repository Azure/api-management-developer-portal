import * as ko from "knockout";
import template from "./authorization.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { Api } from "../../../../../models/api";
import { OAuthSession, StoredCredentials } from "./oauthSession";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { Utils } from "../../../../../utils";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { ConsoleOperation } from "../../../../../models/console/consoleOperation";
import { templates } from "./templates/templates";
import { TemplatingService } from "../../../../../services/templatingService";
import { GrantTypes, TypeOfApi, oauthSessionKey } from "./../../../../../constants";
import { OAuthService } from "../../../../../services/oauthService";
import { Product } from "../../../../../models/product";
import { UnauthorizedError } from "../../../../../errors/unauthorizedError";
import { UsersService } from "../../../../../services/usersService";
import { ApiService } from "../../../../../services/apiService";
import { ProductService } from "../../../../../services/productService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";

@Component({
    selector: "authorization",
    template: template,
})

export class Authorization {
    public readonly selectedGrantType: ko.Observable<string>;
    public templates: Object;
    public readonly authenticated: ko.Observable<boolean>;
    public readonly subscriptionKeyRequired: ko.Observable<boolean>;
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly authorizationError: ko.Observable<string>;
    public readonly products: ko.Observable<Product[]>;
    public readonly selectedSubscriptionKey: ko.Observable<string>;
    public readonly collapsedAuth: ko.Observable<boolean>;
    

    constructor(
        private readonly sessionManager: SessionManager,
        private readonly oauthService: OAuthService,
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
    ) {
        this.collapsedAuth = ko.observable(false);
        this.authorizationServer = ko.observable();
        this.selectedGrantType = ko.observable();
        this.api = ko.observable<Api>();
        this.headers = ko.observableArray<ConsoleHeader>();;
        this.consoleOperation = ko.observable<ConsoleOperation>();
        this.templates = templates;
        this.codeSample = ko.observable<string>();
        this.selectedLanguage = ko.observable<string>();
        this.authenticated = ko.observable(false);
        this.subscriptionKeyRequired = ko.observable();
        this.username = ko.observable();
        this.password = ko.observable();
        this.authorizationError = ko.observable();
        this.products = ko.observable();
        this.selectedSubscriptionKey = ko.observable();
    }

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;

    @Param()
    public api: ko.Observable<Api>;

    @Param()
    public consoleOperation: ko.Observable<ConsoleOperation>;

    @Param()
    public headers: ko.ObservableArray<ConsoleHeader>; 

    @Param()
    public codeSample: ko.Observable<string>;

    @Param()
    public selectedLanguage: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.subscriptionKeyRequired(!!this.api().subscriptionRequired);
        this.selectedSubscriptionKey.subscribe(this.applySubscriptionKey.bind(this));
        this.selectedGrantType.subscribe(this.onGrantTypeChange);
        this.selectedSubscriptionKey(null);
        await this.setupOAuth();
        if (this.api().subscriptionRequired) {
            await this.loadSubscriptionKeys();
        }
    }

    private isGraphQL(): boolean {
        return this.api().type === TypeOfApi.graphQL;
    }

    private async setupOAuth(): Promise<void> {
        const authorizationServer = this.authorizationServer();

        if (!authorizationServer) {
            this.selectedGrantType(null);
            return;
        }

        const api = this.api();
        const scopeOverride = api.authenticationSettings?.oAuth2?.scope;
        const storedCredentials = await this.getStoredCredentials(authorizationServer.name, scopeOverride);

        if (storedCredentials) {
            this.selectedGrantType(storedCredentials.grantType);
            this.setAuthorizationHeader(storedCredentials.accessToken);
        }
    }

    private async getStoredCredentials(serverName: string, scopeOverride: string): Promise<StoredCredentials> {
        const oauthSession = await this.sessionManager.getItem<OAuthSession>(oauthSessionKey);
        const recordKey = this.getSessionRecordKey(serverName, scopeOverride);
        const storedCredentials = oauthSession?.[recordKey];

        try {
            /* Trying to check if it's a JWT token and, if yes, whether it got expired. */
            const jwtToken = Utils.parseJwt(storedCredentials.accessToken.replace(/^bearer /i, ""));
            const now = new Date();

            if (now > jwtToken.exp) {
                await this.clearStoredCredentials();
                return null;
            }
        }
        catch (error) {
            // do nothing
        }

        return storedCredentials;
    }

    private setAuthorizationHeader(accessToken: string): void {
        this.removeAuthorizationHeader();

        const keyHeader = new ConsoleHeader();
        keyHeader.name(KnownHttpHeaders.Authorization);
        keyHeader.value(accessToken);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue("password");
        keyHeader.type = "string";
        keyHeader.required = true;

        if(!this.isGraphQL()) {
            this.consoleOperation().request.headers.push(keyHeader);
            this.updateRequestSummary();
        }
        else {
            this.headers.push(keyHeader);
        }
        
        this.authenticated(true);
    }

    private getSessionRecordKey(authorizationServerName: string, scopeOverride: string): string {
        let recordKey = authorizationServerName;

        if (scopeOverride) {
            recordKey += `-${scopeOverride}`;
        }

        return recordKey;
    }

    private getSubscriptionKeyHeader(): ConsoleHeader {
        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();
        return this.findHeader(subscriptionKeyHeaderName);
    }

    private setSubscriptionKeyHeader(subscriptionKey: string): void {
        this.removeSubscriptionKeyHeader();

        if (!subscriptionKey) {
            return;
        }

        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();

        const keyHeader = new ConsoleHeader();
        keyHeader.name(subscriptionKeyHeaderName);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue("password");
        keyHeader.type = "string";
        keyHeader.required = true;
        keyHeader.value(subscriptionKey);

        if(!this.isGraphQL()) {
            this.consoleOperation().request.headers.push(keyHeader);
            this.updateRequestSummary();
        }
        else {
            this.headers.push(keyHeader);
        }
    }


    private async clearStoredCredentials(): Promise<void> {
        await this.sessionManager.removeItem(oauthSessionKey);
        this.removeAuthorizationHeader();
    }

    private removeAuthorizationHeader(): void {
        const authorizationHeader = this.findHeader(KnownHttpHeaders.Authorization);
        this.removeHeader(authorizationHeader);
        this.authenticated(false);
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

    public async updateRequestSummary(): Promise<void> {
        const template = templates[this.selectedLanguage()];
        const codeSample = await TemplatingService.render(template, ko.toJS(this.consoleOperation));
        this.codeSample(codeSample);
    }

    private findHeader(name: string): ConsoleHeader {
        const searchName = name.toLocaleLowerCase();

        const headers = (this.isGraphQL()) ? this.headers() : this.consoleOperation().request.headers()

        return headers.find(x => x.name()?.toLocaleLowerCase() === searchName);
    }

    private getSubscriptionKeyHeaderName(): string {
        let subscriptionKeyHeaderName: string = KnownHttpHeaders.OcpApimSubscriptionKey;

        if (this.api().subscriptionKeyParameterNames && this.api().subscriptionKeyParameterNames.header) {
            subscriptionKeyHeaderName = this.api().subscriptionKeyParameterNames.header;
        }

        return subscriptionKeyHeaderName;
    }

    private removeSubscriptionKeyHeader(): void {
        const subscriptionKeyHeader = this.getSubscriptionKeyHeader();
        this.removeHeader(subscriptionKeyHeader);
    }

    public removeHeader(header: ConsoleHeader): void {
        if(!this.isGraphQL()) {
            this.consoleOperation().request.headers.remove(header);
            this.updateRequestSummary();
        }
        else {
            this.headers.remove(header);
        }
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
        if (!this.consoleOperation() && !this.isGraphQL()) {
            return;
        }

        if (this.api().type === TypeOfApi.webSocket) {
            this.setSubscriptionKeyParameter(subscriptionKey)
        } else {
            this.setSubscriptionKeyHeader(subscriptionKey);
        }
        
        if(!this.isGraphQL()) {
            this.updateRequestSummary();
        }
    }

    private setSubscriptionKeyParameter(subscriptionKey: string): void {
        const subscriptionKeyParam = this.getSubscriptionKeyParam();
        this.removeQueryParameter(subscriptionKeyParam);

        if (!subscriptionKey) {
            return;
        }

        const subscriptionKeyParamName = this.getSubscriptionKeyParamName();

        const keyParameter = new ConsoleParameter();
        keyParameter.name(subscriptionKeyParamName);
        keyParameter.value(subscriptionKey);
        keyParameter.secret = true;
        keyParameter.type = "string";
        keyParameter.canRename = false;
        keyParameter.required = true;
        keyParameter.inputType("password");

        this.consoleOperation().request.queryParameters.push(keyParameter);
        this.updateRequestSummary();
    }

    private getSubscriptionKeyParam(): ConsoleParameter {
        const subscriptionKeyParamName = this.getSubscriptionKeyParamName();
        const searchName = subscriptionKeyParamName.toLocaleLowerCase();

        return this.consoleOperation().request.queryParameters().find(x => x.name()?.toLocaleLowerCase() === searchName);
    }

    private getSubscriptionKeyParamName(): string {
        let subscriptionKeyParamName = "subscription-key";

        if (this.api().subscriptionKeyParameterNames && this.api().subscriptionKeyParameterNames.query) {
            subscriptionKeyParamName = this.api().subscriptionKeyParameterNames.query;
        }

        return subscriptionKeyParamName;
    }

    public removeQueryParameter(parameter: ConsoleParameter): void {
        this.consoleOperation().request.queryParameters.remove(parameter);
        this.updateRequestSummary();
    }

    public collapseAuth(): void {
        this.collapsedAuth(!this.collapsedAuth());
    }
}