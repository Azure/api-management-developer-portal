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
import { GrantTypes, TypeOfApi, oauthSessionKey } from "./../../../../../constants";
import { OAuthService } from "../../../../../services/oauthService";
import { Product } from "../../../../../models/product";
import { UnauthorizedError } from "../../../../../errors/unauthorizedError";
import { UsersService } from "../../../../../services/usersService";
import { ApiService } from "../../../../../services/apiService";
import { ProductService } from "../../../../../services/productService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";
import { OAuth2AuthenticationSettings } from "../../../../../contracts/authenticationSettings";
import * as Constants from "../../../../../constants";
import { SearchQuery } from "../../../../../contracts/searchQuery";

interface SubscriptionOption {
    name: string;
    value: string;
}

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
    public readonly selectedSubscriptionKey: ko.Observable<SubscriptionOption>;
    public readonly subscriptionKeyRevealed: ko.Observable<boolean>;
    private deleteAuthorizationHeader: boolean = false;
    public readonly selectedAuthorizationServer: ko.Observable<AuthorizationServer>;
    public readonly subscriptionsPattern: ko.Observable<string>;
    public readonly subscriptionSelection: ko.Computed<string>;
    public readonly isSubscriptionListEmptyDueToFilter: ko.Observable<boolean>;
    public readonly subscriptionsLoading = ko.observable<boolean>(false);

    constructor(
        private readonly sessionManager: SessionManager,
        private readonly oauthService: OAuthService,
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
    ) {
        this.selectedGrantType = ko.observable();
        this.api = ko.observable<Api>();
        this.headers = ko.observableArray<ConsoleHeader>();
        this.queryParameters = ko.observableArray<ConsoleParameter>();
        this.consoleOperation = ko.observable<ConsoleOperation>();
        this.templates = templates;
        this.authenticated = ko.observable(false);
        this.subscriptionKeyRequired = ko.observable();
        this.username = ko.observable();
        this.password = ko.observable();
        this.authorizationError = ko.observable();
        this.products = ko.observable();
        this.selectedSubscriptionKey = ko.observable();
        this.subscriptionKeyRevealed = ko.observable(false);
        this.authorizationServers = ko.observable<AuthorizationServer[]>();
        this.selectedAuthorizationServer = ko.observable<AuthorizationServer>();
        this.subscriptionsPattern = ko.observable();
        this.isSubscriptionListEmptyDueToFilter = ko.observable(false);
        this.subscriptionsLoading = ko.observable(true);
        this.subscriptionSelection = ko.computed(() => {
            return this.selectedSubscriptionKey() ? this.selectedSubscriptionKey().name : "Select a subscription";
        });
    }

    @Param()
    public authorizationServers: ko.Observable<AuthorizationServer[]>;

    @Param()
    public api: ko.Observable<Api>;

    @Param()
    public consoleOperation: ko.Observable<ConsoleOperation>;

    @Param()
    public headers: ko.ObservableArray<ConsoleHeader>;

    @Param()
    public queryParameters: ko.ObservableArray<ConsoleParameter>;

    @Param()
    public updateRequestSummary: () => Promise<void>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.subscriptionKeyRequired(!!this.api().subscriptionRequired);

        if (this.subscriptionKeyRequired()) {
            if (this.api().type === TypeOfApi.webSocket || this.isGraphQL()) {
                this.setSubscriptionKeyParameter();
            } else {
                this.setSubscriptionKeyHeader();
            }
        }

        this.selectedGrantType.subscribe(this.onGrantTypeChange);
        this.selectedSubscriptionKey.subscribe(this.applySubscriptionKey.bind(this));
        this.selectedAuthorizationServer(this.authorizationServers() ? this.authorizationServers()[0] : null);
        this.selectedAuthorizationServer.subscribe(() => this.selectedGrantType(null));

        await this.setupOAuth();
        if (this.api().subscriptionRequired) {
            await this.loadSubscriptionKeys(true);
        }

        this.subscriptionsPattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSubscriptionsSearch);
    }

    public async resetSubscriptionsSearch(): Promise<void> {
        this.loadSubscriptionKeys();
    }

    public toggleSubscriptionKey(): void {
        this.subscriptionKeyRevealed(!this.subscriptionKeyRevealed());
    }

    private isGraphQL(): boolean {
        return this.api().type === TypeOfApi.graphQL;
    }

    private async setupOAuth(): Promise<void> {
        const authorizationServer = this.selectedAuthorizationServer();

        if (!authorizationServer) {
            this.selectedGrantType(null);
            return;
        }

        const api = this.api();
        const serverName = authorizationServer.name;

        const scopeOverride = this.getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);
        const storedCredentials = await this.getStoredCredentials(serverName, scopeOverride);


        if (storedCredentials) {
            this.selectedGrantType(storedCredentials.grantType);
            this.setAuthorizationHeader(storedCredentials.accessToken);
        }
    }

    public selectSubscription(subscription: SubscriptionOption) {
        this.selectedSubscriptionKey(subscription);
        this.closeDropdown();
    }

    private async getStoredCredentials(serverName: string, scopeOverride: string): Promise<StoredCredentials> {
        const oauthSession = await this.sessionManager.getItem<OAuthSession>(oauthSessionKey);
        const recordKey = this.getSessionRecordKey(serverName, scopeOverride);
        const storedCredentials = oauthSession?.[recordKey];
        if (!storedCredentials) {
            return null;
        }

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
        const authorizationHeader = this.getAuthorizationHeader();

        if (authorizationHeader) {
            authorizationHeader.value(accessToken);
            this.deleteAuthorizationHeader = false;
            return;
        }

        this.deleteAuthorizationHeader = true;
        const keyHeader = new ConsoleHeader();
        keyHeader.name(KnownHttpHeaders.Authorization);
        keyHeader.description = "Subscription key.";
        keyHeader.secret(true);
        keyHeader.inputTypeValue("password");
        keyHeader.type = "string";
        keyHeader.required = false;
        keyHeader.value(accessToken);

        if (!this.isGraphQL()) {
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

    private getAuthorizationHeader(): ConsoleHeader {
        return this.findHeader(KnownHttpHeaders.Authorization);
    }

    private setSubscriptionKeyHeader(subscriptionKey?: string): void {
        this.removeSubscriptionKeyHeader();
        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();

        const keyHeader = new ConsoleHeader();
        keyHeader.name(subscriptionKeyHeaderName);
        keyHeader.description = "Subscription key.";
        keyHeader.secret(true);
        keyHeader.inputTypeValue("password");
        keyHeader.type = "string";
        keyHeader.required = true;
        keyHeader.value.extend(<any>{ required: { message: `Value is required.` } });
        keyHeader.value(subscriptionKey);

        if (!this.isGraphQL()) {
            this.consoleOperation().request.headers.push(keyHeader);
            this.updateRequestSummary();
        }
        else {
            this.headers.push(keyHeader);
        }
    }

    private async clearStoredCredentials(): Promise<void> {
        await this.sessionManager.removeItem(oauthSessionKey);
    }

    private removeAuthorizationHeader(): void {
        const authorizationHeader = this.getAuthorizationHeader();

        if (authorizationHeader) {
            if (!this.deleteAuthorizationHeader) {
                authorizationHeader.value(null);
            } else {
                this.removeHeader(authorizationHeader);
            }
        }

        this.authenticated(false);
    }

    private async onGrantTypeChange(grantType: string): Promise<void> {
        await this.clearStoredCredentials();

        if (!grantType || grantType === GrantTypes.password) {
            this.removeAuthorizationHeader();
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
        const authorizationServer = this.selectedAuthorizationServer();

        if (!authorizationServer) {
            return;
        }

        const serverName = authorizationServer.name;
        const scopeOverride = this.getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);

        if (scopeOverride) {
            authorizationServer.scopes = [scopeOverride];
        }

        const accessToken = await this.oauthService.authenticate(grantType, authorizationServer, api.name);

        if (!accessToken) {
            return;
        }

        await this.setStoredCredentials(serverName, scopeOverride, grantType, accessToken);

        this.setAuthorizationHeader(accessToken);
    }

    private findHeader(name: string): ConsoleHeader {
        const searchName = name.toLocaleLowerCase();

        const headers = (this.isGraphQL()) ? this.headers() : this.consoleOperation().request.headers();

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
        if (!this.isGraphQL()) {
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

            const authorizationServer = this.selectedAuthorizationServer();
            if (!authorizationServer) {
                return;
            }

            const serverName = authorizationServer.name;
            const scopeOverride = this.getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);


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

    private async loadSubscriptionKeys(selectFirstSubscription: boolean = false): Promise<void> {
        this.subscriptionsLoading(true);
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            return;
        }

        const subscriptionsQuery: SearchQuery = {
            pattern: this.subscriptionsPattern()
        };

        const pageOfProducts = await this.apiService.getAllApiProducts(this.api().id);
        const products = pageOfProducts && pageOfProducts.value ? pageOfProducts.value : [];
        const allSubscriptions = await this.productService.getProductsAllSubscriptions(this.api().name, products, userId, subscriptionsQuery);
        const subscriptions = allSubscriptions.filter(subscription => subscription.state === SubscriptionState.active);
        const availableProducts = [];

        const productsSubscriptions = allSubscriptions.filter(subscription => !this.productService.isProductScope(subscription.scope, this.api().name));
        products.forEach(product => {
            const keys: SubscriptionOption[] = [];

            if (productsSubscriptions.length === 0) {
                return;
            }

            productsSubscriptions.forEach(subscription => {
                if (!this.productService.isProductScope(subscription.scope, product.name)) {
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

        const apiSubscriptions = allSubscriptions.filter(subscription => this.productService.isProductScope(subscription.scope, this.api().name));
        const apiKeys: SubscriptionOption[] = [];
        apiSubscriptions.forEach(subscription => {
            apiKeys.push({
                name: `Primary: ${subscription.name?.trim() || subscription.primaryKey.substr(0, 4)}`,
                value: subscription.primaryKey
            });

            apiKeys.push({
                name: `Secondary: ${subscription.name?.trim() || subscription.secondaryKey.substr(0, 4)}`,
                value: subscription.secondaryKey
            });
        });
        if(apiKeys.length > 0) {
            availableProducts.push({ name: "Apis", subscriptionKeys: apiKeys });
        }

        this.isSubscriptionListEmptyDueToFilter(availableProducts.length == 0 && this.subscriptionsPattern() !== undefined);
        this.products(availableProducts);
        this.subscriptionsLoading(false);

        if (subscriptions.length == 0) {
            return;
        }

        if (availableProducts.length > 0 && selectFirstSubscription) {
            const subscriptionKey = availableProducts[0].subscriptionKeys[0];
            this.selectedSubscriptionKey(subscriptionKey);
            this.applySubscriptionKey(subscriptionKey);
        }
    }

    private applySubscriptionKey(subscriptionKey: SubscriptionOption): void {
        if (!this.consoleOperation() && !this.isGraphQL()) {
            return;
        }

        if (this.api().type === TypeOfApi.webSocket || this.isGraphQL()) {
            this.setSubscriptionKeyParameter(subscriptionKey.value);
        } else {
            this.setSubscriptionKeyHeader(subscriptionKey.value);
        }

        if (!this.isGraphQL()) {
            this.updateRequestSummary();
        }
    }

    private setSubscriptionKeyParameter(subscriptionKey?: string): void {
        const subscriptionKeyParam = this.getSubscriptionKeyParam();
        this.removeQueryParameter(subscriptionKeyParam);
        const subscriptionKeyParamName = this.getSubscriptionKeyParamName();

        const keyParameter = new ConsoleParameter();
        keyParameter.name(subscriptionKeyParamName);
        keyParameter.secret = true;
        keyParameter.type = "string";
        keyParameter.canRename = false;
        keyParameter.required = true;
        keyParameter.inputType("password");
        keyParameter.value.extend(<any>{ required: { message: `Value is required.` } });
        keyParameter.value(subscriptionKey);

        if (this.isGraphQL()) {
            this.queryParameters.push(keyParameter);
        }
        else {
            this.consoleOperation().request.queryParameters.push(keyParameter);
            this.updateRequestSummary();
        }
    }

    private getSubscriptionKeyParam(): ConsoleParameter {
        const subscriptionKeyParamName = this.getSubscriptionKeyParamName();
        const searchName = subscriptionKeyParamName.toLocaleLowerCase();
        const queryParameters = this.isGraphQL() ? this.queryParameters() : this.consoleOperation().request.queryParameters();
        return queryParameters.find(x => x.name()?.toLocaleLowerCase() === searchName);
    }

    private getSubscriptionKeyParamName(): string {
        let subscriptionKeyParamName = "subscription-key";

        if (this.api().subscriptionKeyParameterNames && this.api().subscriptionKeyParameterNames.query) {
            subscriptionKeyParamName = this.api().subscriptionKeyParameterNames.query;
        }

        return subscriptionKeyParamName;
    }

    public removeQueryParameter(parameter: ConsoleParameter): void {
        if (this.isGraphQL()) {
            this.queryParameters.remove(parameter);
        }
        else {
            this.consoleOperation().request.queryParameters.remove(parameter);
            this.updateRequestSummary();
        }
    }

    private getSelectedAuthServerOverrideScope(selectedAuthServerName: string, oAuth2Settings: OAuth2AuthenticationSettings[]): string {
        if (selectedAuthServerName && oAuth2Settings) {
            const authServerName = selectedAuthServerName.toLowerCase();
            const setting = oAuth2Settings.find(setting => setting.authorizationServerId?.toLowerCase() == authServerName);
            return setting?.scope;
        }
        return null;
    }

    private closeDropdown(): true {
        const subscriptionDropdowm = document.getElementById("subscriptions-dropdown");
        if (subscriptionDropdowm.classList.contains("show")) {
            subscriptionDropdowm.classList.remove("show");
        }
        // return true to not-prevent the default action https://knockoutjs.com/documentation/click-binding.html#note-3-allowing-the-default-click-action
        return true;
    }
}