import * as ko from "knockout";
import * as validation from "knockout.validation";
import * as _ from "lodash";
import template from "./operation-console.html";
import { Component, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Operation } from "../../../../../models/operation";
import { ApiService } from "../../../../../services/apiService";
import { ConsoleOperation } from "../../../../../models/console/consoleOperation";
import { ConsoleHeader } from "../../../../../models/console/consoleHeader";
import { Utils } from "../../../../../utils";
import { KnownHttpHeaders } from "../../../../../models/knownHttpHeaders";
import { Api } from "../../../../../models/api";
import { KnownStatusCodes } from "../../../../../models/knownStatusCodes";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { TenantService } from "../../../../../services/tenantService";
import { ServiceSkuName, TypeOfApi } from "../../../../../constants";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Revision } from "../../../../../models/revision";
import { templates } from "./templates/templates";
import { ConsoleParameter } from "../../../../../models/console/consoleParameter";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TemplatingService } from "../../../../../services/templatingService";
import { OAuthService } from "../../../../../services/oauthService";
import { AuthorizationServer } from "../../../../../models/authorizationServer";


@Component({
    selector: "operation-console",
    template: template
})
export class OperationConsole {
    public readonly sendingRequest: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly consoleOperation: ko.Observable<ConsoleOperation>;
    public readonly secretsRevealed: ko.Observable<boolean>;
    public readonly responseStatusCode: ko.Observable<string>;
    public readonly responseStatusText: ko.Observable<string>;
    public readonly responseBody: ko.Observable<string>;
    public readonly responseHeadersString: ko.Observable<string>;
    public readonly products: ko.Observable<Product[]>;
    public readonly selectedSubscriptionKey: ko.Observable<string>;
    public readonly selectedLanguage: ko.Observable<string>;
    public readonly selectedProduct: ko.Observable<Product>;
    public readonly requestError: ko.Observable<string>;
    public readonly codeSample: ko.Observable<string>;
    public readonly selectedHostname: ko.Observable<string>;
    public readonly isHostnameWildcarded: ko.Computed<boolean>;
    public readonly hostnameSelectionEnabled: ko.Observable<boolean>;
    public readonly wildcardSegment: ko.Observable<string>;
    public readonly selectedGrantType: ko.Observable<string>;
    public masterKey: string;
    public isConsumptionMode: boolean;
    public templates: Object;

    constructor(
        private readonly apiService: ApiService,
        private readonly tenantService: TenantService,
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly httpClient: HttpClient,
        private readonly routeHelper: RouteHelper,
        private readonly oauthService: OAuthService
    ) {
        this.templates = templates;
        this.products = ko.observable();

        this.requestError = ko.observable();
        this.responseStatusCode = ko.observable();
        this.responseStatusText = ko.observable();
        this.responseHeadersString = ko.observable();
        this.responseBody = ko.observable();
        this.selectedLanguage = ko.observable("http");
        this.api = ko.observable<Api>();
        this.revision = ko.observable();
        this.operation = ko.observable();
        this.hostnames = ko.observable();
        this.consoleOperation = ko.observable();
        this.secretsRevealed = ko.observable();
        this.selectedSubscriptionKey = ko.observable();
        this.working = ko.observable(true);
        this.sendingRequest = ko.observable(false);
        this.codeSample = ko.observable();
        this.selectedProduct = ko.observable();
        this.onFileSelect = this.onFileSelect.bind(this);
        this.selectedHostname = ko.observable("");
        this.hostnameSelectionEnabled = ko.observable();
        this.isHostnameWildcarded = ko.computed(() => this.selectedHostname().includes("*"));
        this.selectedGrantType = ko.observable();
        this.authorizationServer = ko.observable();

        this.wildcardSegment = ko.observable();

        validation.rules["maxFileSize"] = {
            validator: (file: File, maxSize: number) => !file || file.size < maxSize,
            message: (size) => `The file size cannot exceed ${Utils.formatBytes(size)}.`
        };

        validation.registerExtenders();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });
    }

    @Param()
    public api: ko.Observable<Api>;

    @Param()
    public operation: ko.Observable<Operation>;

    @Param()
    public revision: ko.Observable<Revision>;

    @Param()
    public hostnames: ko.Observable<string[]>;

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const skuName = await this.tenantService.getServiceSkuName();
        this.masterKey = await this.tenantService.getServiceMasterKey();
        this.isConsumptionMode = skuName === ServiceSkuName.Consumption;

        await this.resetConsole();

        this.selectedHostname.subscribe(this.setHostname);
        this.wildcardSegment.subscribe((wildcardSegment) => {
            const hostname = wildcardSegment
                ? this.selectedHostname().replace("*", wildcardSegment)
                : this.selectedHostname();

            this.setHostname(hostname);
        });
        this.selectedSubscriptionKey.subscribe(this.applySubscriptionKey.bind(this));
        this.api.subscribe(this.resetConsole);
        this.operation.subscribe(this.resetConsole);
        this.selectedLanguage.subscribe(this.updateRequestSummary);
        this.selectedGrantType.subscribe(this.authenticateOAuth);
    }

    private async resetConsole(): Promise<void> {
        const selectedOperation = this.operation();
        const selectedApi = this.api();

        if (!selectedApi || !selectedOperation) {
            return;
        }

        this.working(true);
        this.sendingRequest(false);
        this.consoleOperation(null);
        this.secretsRevealed(false);
        this.responseStatusCode(null);
        this.responseStatusText(null);
        this.responseBody(null);
        this.selectedSubscriptionKey(null);
        this.selectedProduct(null);

        const operation = await this.apiService.getOperation(selectedOperation.id);
        const consoleOperation = new ConsoleOperation(selectedApi, operation);
        this.consoleOperation(consoleOperation);

        const hostnames = this.hostnames();
        this.hostnameSelectionEnabled(this.hostnames()?.length > 1);

        const hostname = hostnames[0];
        this.selectedHostname(hostname);

        this.hostnameSelectionEnabled(this.hostnames()?.length > 1);
        consoleOperation.host.hostname(hostname);

        if (this.api().type === TypeOfApi.soap) {
            this.setSoapHeaders();
        }

        if (!this.isConsumptionMode) {
            this.setNoCacheHeader();
        }

        if (this.api().apiVersionSet && this.api().apiVersionSet.versioningScheme === "Header") {
            this.setVersionHeader();
        }

        await this.loadSubscriptionKeys();

        this.updateRequestSummary();
        this.working(false);
    }

    private setSoapHeaders(): void {
        const consoleOperation = this.consoleOperation();
        const representation = consoleOperation.request.representations[0];

        if (representation) {
            if (representation.contentType.toLowerCase() === "text/xml".toLowerCase()) {
                // Soap 1.1
                consoleOperation.setHeader(KnownHttpHeaders.SoapAction, `"${consoleOperation.urlTemplate.split("=")[1]}"`);
            }

            if (representation.contentType.toLowerCase() === "application/soap+xml".toLowerCase()) {
                // Soap 1.2
                const contentHeader = consoleOperation.request.headers()
                    .find(header => header.name().toLowerCase() === KnownHttpHeaders.ContentType.toLowerCase());

                if (contentHeader) {
                    const contentType = `${contentHeader.value};action="${consoleOperation.urlTemplate.split("=")[1]}"`;
                    consoleOperation.setHeader(KnownHttpHeaders.ContentType, contentType);
                }
            }
        }
        else {
            consoleOperation.setHeader(KnownHttpHeaders.SoapAction, "\"" + consoleOperation.urlTemplate.split("=")[1] + "\"");
        }

        consoleOperation.urlTemplate = "";
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
                    name: `Primary-${subscription.primaryKey.substr(0, 4)}`,
                    value: subscription.primaryKey
                });

                keys.push({
                    name: `Secondary-${subscription.secondaryKey.substr(0, 4)}`,
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

    private setHostname(hostname: string): void {
        this.consoleOperation().host.hostname(hostname);
        this.updateRequestSummary();
    }

    public addHeader(): void {
        this.consoleOperation().request.headers.push(new ConsoleHeader());
        this.updateRequestSummary();
    }

    public removeHeader(header: ConsoleHeader): void {
        this.consoleOperation().request.headers.remove(header);
        this.updateRequestSummary();
    }

    private findHeader(name: string): ConsoleHeader {
        const searchName = name.toLocaleLowerCase();
        return this.consoleOperation().request.headers().find(x => x.name().toLocaleLowerCase() === searchName);
    }

    public addQueryParameter(): void {
        this.consoleOperation().request.queryParameters.push(new ConsoleParameter());
        this.updateRequestSummary();
    }

    public removeQueryParameter(parameter: ConsoleParameter): void {
        this.consoleOperation().request.queryParameters.remove(parameter);
        this.updateRequestSummary();
    }

    private applySubscriptionKey(subscriptionKey: string): void {
        if (!this.consoleOperation()) {
            return;
        }

        this.setSubscriptionKeyHeader(subscriptionKey);
        this.updateRequestSummary();
    }

    private setNoCacheHeader(): void {
        this.consoleOperation().setHeader(KnownHttpHeaders.CacheControl, "no-cache", "string", "Disable caching.");
    }

    private setVersionHeader(): void {
        this.consoleOperation().setHeader(this.api().apiVersionSet.versionHeaderName, this.api().apiVersion, "string", "API version");
    }

    private getSubscriptionKeyHeaderName(): string {
        let subscriptionKeyHeaderName = KnownHttpHeaders.OcpApimSubscriptionKey;

        if (this.api().subscriptionKeyParameterNames && this.api().subscriptionKeyParameterNames.header) {
            subscriptionKeyHeaderName = this.api().subscriptionKeyParameterNames.header;
        }

        return subscriptionKeyHeaderName;
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
        keyHeader.value(subscriptionKey);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue = "password";
        keyHeader.type = "string";
        keyHeader.required = true;

        this.consoleOperation().request.headers.push(keyHeader);
        this.updateRequestSummary();
    }

    private removeAuthorizationHeader(): void {
        const authorizationHeader = this.findHeader(KnownHttpHeaders.Authorization);
        this.removeHeader(authorizationHeader);
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

        this.consoleOperation().request.headers.push(keyHeader);
        this.updateRequestSummary();
    }

    private setMasterSubsciptionKeyHeader(): void {
        const subscriptionKey = this.selectedProduct
            ? `${this.masterKey};product=${this.selectedProduct}`
            : this.masterKey;

        this.setSubscriptionKeyHeader(subscriptionKey);
    }

    private removeSubscriptionKeyHeader(): void {
        const subscriptionKeyHeader = this.getSubscriptionKeyHeader();
        this.removeHeader(subscriptionKeyHeader);
    }

    public async updateRequestSummary(): Promise<void> {
        const template = templates[this.selectedLanguage()];
        const codeSample = await TemplatingService.render(template, ko.toJS(this.consoleOperation));

        this.codeSample(codeSample);
    }

    public onFileSelect(file: File): void {
        this.consoleOperation().request.binary(file);
        this.updateRequestSummary();
    }

    public async validateAndSendRequest(): Promise<void> {
        const operation = this.consoleOperation();
        const templateParameters = operation.templateParameters();
        const queryParameters = operation.request.queryParameters();
        const headers = operation.request.headers();
        const binary = operation.request.binary;
        const parameters = [].concat(templateParameters, queryParameters, headers);
        const validationGroup = validation.group(parameters.map(x => x.value).concat(binary), { live: true });
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
        this.responseStatusCode(null);

        const consoleOperation = this.consoleOperation();
        const request = consoleOperation.request;
        const url = consoleOperation.requestUrl();
        const method = consoleOperation.method;
        const headers = [...request.headers()];

        let payload;

        switch (consoleOperation.request.bodyFormat()) {
            case "raw":
                payload = request.body();
                break;

            case "binary":
                const formData = new FormData();
                formData.append(request.binary().name, request.binary());
                payload = formData;
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

            const response = await this.httpClient.send(request);
            this.responseHeadersString(response.headers.map(x => `${x.name}: ${x.value}`).join("\n"));

            const knownStatusCode = KnownStatusCodes.find(x => x.code === response.statusCode);

            const responseStatusText = knownStatusCode
                ? knownStatusCode.description
                : "Unknown";

            this.responseStatusCode(response.statusCode.toString());
            this.responseStatusText(responseStatusText);
            this.responseBody(response.toText());

            const responseHeaders = response.headers.map(x => {
                const consoleHeader = new ConsoleHeader();
                consoleHeader.name(x.name);
                consoleHeader.value(x.value);
                return consoleHeader;
            });

            const contentTypeHeader = responseHeaders.find((header) => header.name().toLowerCase() === KnownHttpHeaders.ContentType.toLowerCase());

            if (contentTypeHeader) {
                if (contentTypeHeader.value().toLowerCase().indexOf("json") >= 0) {
                    this.responseBody(Utils.formatJson(this.responseBody()));
                }

                if (contentTypeHeader.value().toLowerCase().indexOf("xml") >= 0) {
                    this.responseBody(Utils.formatXml(this.responseBody()));
                }
            }
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

    public toggleRequestSummarySecrets(): void {
        this.secretsRevealed(!this.secretsRevealed());
    }

    public getApiReferenceUrl(): string {
        return this.routeHelper.getApiReferenceUrl(this.api().name);
    }

    /**
     * Initiates specified authentication flow.
     * @param grantType OAuth grant type, e.g. "implicit" or "authorizationCode".
     */
    public async authenticateOAuth(grantType: string): Promise<void> {
        this.removeAuthorizationHeader();

        if (!grantType) {
            return;
        }

        const api = this.api();
        const authorizationServer = this.authorizationServer();
        const scopeOverride = api.authenticationSettings?.oAuth2?.scope;

        if (scopeOverride) {
            authorizationServer.scopes = [scopeOverride];
        }

        const accessToken = await this.oauthService.authenticate(grantType, authorizationServer);

        this.setAuthorizationHeader(accessToken);
    }
}