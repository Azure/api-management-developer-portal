import * as ko from "knockout";
import * as _ from "lodash";
import template from "./operation-console.html";
import { Component, Param } from "@paperbits/common/ko/decorators";
import { Operation } from "../../../models/operation";
import { ApiService } from "../../../services/apiService";
import { ConsoleOperation } from "../../../models/console/consoleOperation";
import { ConsoleHeader } from "../../../models/console/consoleHeader";
import { Utils } from "../../../utils";
import { KnownHttpHeaders } from "../../../models/knownHttpHeaders";
import { Api } from "../../../models/api";
import { ConsoleTrace } from "../../../models/console/consoleTrace";
import { KnownStatusCodes } from "../../../models/knownStatusCodes";
import { Trace } from "../../../contracts/trace";
import { Product } from "../../../models/product";
import { ProductService } from "../../../services/productService";
import { UsersService } from "../../../services/usersService";
import { TenantService } from "../../../services/tenantService";
import { ServiceSkuName, TypeOfApi } from "../../../constants";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Revision } from "../../../models/revision";
import { templates } from "../templates/templates";

@Component({
    selector: "operation-console",
    template: template,
    injectable: "operationConsole"
})
export class OperationConsole {
    private portalHostname: string;
    private masterKey: string;

    @Param()
    public api: KnockoutObservable<Api>;

    @Param()
    public operation: KnockoutObservable<Operation>;

    @Param()
    public revision: KnockoutObservable<Revision>;

    public working: boolean;
    public consoleOperation: KnockoutObservable<ConsoleOperation>;
    public requestSummarySecretsRevealed: boolean;
    public responseStatusCode: KnockoutObservable<string>;
    public responseStatusText: KnockoutObservable<string>;
    public responseBody: KnockoutObservable<string>;
    public responseContentType: string;
    public responseHeadersString: KnockoutObservable<string>;
    public products: any[];
    public selectedSubscriptionKey: string;
    public subscriptionKeysView: string;
    public apiProductsView: string;
    public consoleTrace: KnockoutObservable<ConsoleTrace>;
    public consoleTraceError: KnockoutObservable<string>;
    public oauthView: string;
    public currentViewName: string;
    public mockingEnabled: boolean;
    public gotOpenProduct: boolean;
    public selectedTab: string;
    public selectedLanguage: KnockoutObservable<string>;
    public isConsumptionMode: boolean;
    public selectedProduct: Product;
    public canSelectProduct: boolean;
    public responseActiveTab: KnockoutObservable<string>;
    public requestSummary: KnockoutObservable<string>;
    public bodySource: KnockoutObservable<string>;
    public attachment: KnockoutObservable<string>;
    public templates: Object;

    constructor(
        private readonly apiService: ApiService,
        private readonly tenantService: TenantService,
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly httpClient: HttpClient,
        // private readonly hostService: HostService,
        // private readonly corsService: CorsService
    ) {
        this.templates = templates;
        this.updateConsole = this.updateConsole.bind(this);
        this.updateRequestSummary = this.updateRequestSummary.bind(this);
        this.selectMessageTab = this.selectMessageTab.bind(this);
        this.selectTraceTab = this.selectTraceTab.bind(this);

        this.products = [];

        this.attachment = ko.observable();
        this.bodySource = ko.observable("Raw");
        this.requestSummary = ko.observable();
        this.responseStatusCode = ko.observable();
        this.responseStatusText = ko.observable();
        this.responseHeadersString = ko.observable();
        this.responseBody = ko.observable();
        this.consoleTrace = ko.observable();
        this.consoleTraceError = ko.observable();

        this.responseActiveTab = ko.observable("message");
        this.selectedLanguage = ko.observable("http");

        this.api = ko.observable<Api>();
        this.api.subscribe(this.updateConsole);
        this.revision = ko.observable<Revision>();

        this.operation = ko.observable<Operation>();
        this.operation.subscribe(this.updateConsole);

        this.consoleOperation = ko.observable<ConsoleOperation>();
    }

    public async updateConsole(): Promise<void> {
        if (!this.api() || !this.operation()) {
            return;
        }

        this.working = true;
        this.requestSummarySecretsRevealed = false;
        this.responseStatusCode(null);
        this.responseStatusText(null);
        this.responseBody(null);
        this.consoleTrace(null);
        this.responseContentType = null;
        this.mockingEnabled = false;
        this.products = [];
        this.selectedSubscriptionKey = null;
        this.selectedTab = "message";
        this.selectedProduct = null;
        this.canSelectProduct = true;

        const skuName = await this.tenantService.getServiceSkuName();
        this.masterKey = await this.tenantService.getServiceMasterKey();
        this.isConsumptionMode = skuName === ServiceSkuName.Consumption;

        this.working = false;

        this.consoleOperation(new ConsoleOperation(this.api(), this.operation(), this.revision()));

        const proxyHostnames = await this.tenantService.getProxyHostnames();
        const hostname = proxyHostnames[0];

        this.consoleOperation().host.hostname(hostname);

        await this.loadProducts();
        await this.loadSubscriptionKeys();

        if (this.api().type === TypeOfApi.soap) {
            this.setSoapHeaders();
        }

        if (!this.isConsumptionMode) {
            this.setNoCacheHeader();
            this.setTraceHeader();
        }
        else {
            this.canSelectProduct = !this.isKeyProvidedByUser();
        }

        if (this.api().apiVersionSet && this.api().apiVersionSet.versioningScheme === "Header") {
            this.setVersionHeader();
        }

        this.updateRequestSummary();
    }

    private setSoapHeaders(): void {
        const representation = this.consoleOperation().request.representations[0];

        if (representation) {
            if (representation.contentType.toLowerCase() === "text/xml".toLowerCase()) {
                // Soap 1.1
                this.consoleOperation().setHeader(KnownHttpHeaders.SoapAction, `"${this.consoleOperation().urlTemplate.split("=")[1]}"`);
            }

            if (representation.contentType.toLowerCase() === "application/soap+xml".toLowerCase()) {
                // Soap 1.2
                const contentHeader = this.consoleOperation().request.headers()
                    .find(header => header.name().toLowerCase() === KnownHttpHeaders.ContentType.toLowerCase());

                if (contentHeader) {
                    const contentType = `${contentHeader.value};action="${this.consoleOperation().urlTemplate.split("=")[1]}"`;
                    this.consoleOperation().setHeader(KnownHttpHeaders.ContentType, contentType);
                }
            }
        }
        else {
            this.consoleOperation().setHeader(KnownHttpHeaders.SoapAction, "\"" + this.consoleOperation().urlTemplate.split("=")[1] + "\"");
        }

        this.consoleOperation().urlTemplate = "";
    }

    private async loadProducts(): Promise<boolean> {
        this.apiProductsView = "loading";

        const pageOfApiProducts = await this.apiService.getAllApiProducts(this.api().id);

        this.products = pageOfApiProducts.value;

        if (this.products.length > 0) {
            this.apiProductsView = "loaded";
        }
        else {
            this.apiProductsView = "none";
        }

        return true;
    }

    private async loadSubscriptionKeys(): Promise<void> {
        this.subscriptionKeysView = "loading";

        const pageOfProducts = await this.apiService.getAllApiProducts(this.api().id);
        const apiProducts = pageOfProducts && pageOfProducts.value ? pageOfProducts.value : [];

        this.gotOpenProduct = apiProducts.some(product => !product.subscriptionRequired);

        if (this.gotOpenProduct) {
            this.subscriptionKeysView = "open";
            return;
        }

        const pageOfSubscriptions = await this.productService.getSubscriptions(this.usersService.getCurrentUserId());
        const subscriptions = pageOfSubscriptions.value.filter(subscription => subscription.state === "active");
        const availableProducts = [];

        apiProducts.forEach(product => {
            const keys = [];
            const productId = product.name;

            subscriptions.forEach(subscription => {
                if (subscription.productId.endsWith(productId)) {

                    keys.push({
                        name: `Primary-${subscription.primaryKey.substr(0, 4)}`,
                        value: subscription.primaryKey
                    });
                    keys.push({
                        name: `Secondary-${subscription.secondaryKey.substr(0, 4)}`,
                        value: subscription.secondaryKey
                    });
                }
            });

            if (keys.length > 0) {
                availableProducts.push({ name: product.name, subscriptionKeys: keys });
            }
        });

        this.products = availableProducts;

        if (availableProducts.length > 0) {
            this.subscriptionKeysView = "loaded";
            this.selectedSubscriptionKey = availableProducts[0].subscriptionKeys[0].value;

            if (this.consoleOperation && this.consoleOperation().request) {
                this.setSubscriptionKeyHeader();
            }
        } else {
            this.subscriptionKeysView = "none";
        }
    }

    public applySubscriptionKey(subscriptionKey: string): void {
        this.selectedSubscriptionKey = subscriptionKey;
        this.setSubscriptionKeyHeader();
    }

    private setNoCacheHeader(): void {
        this.consoleOperation().setHeader(KnownHttpHeaders.CacheControl, "no-cache", "string", "Disable caching.");
    }

    private setTraceHeader(): void {
        this.consoleOperation().setHeader(KnownHttpHeaders.OcpApimTrace, "true", "bool", "Enable request tracing.");
    }

    private setVersionHeader(): void {
        this.consoleOperation().setHeader(this.api().apiVersionSet.versionHeaderName, this.api().apiVersion, "string", "API version");
    }

    private findRequestHeader(headerName: string): ConsoleHeader {
        return this.consoleOperation().request.headers().find(header => header.name().toLowerCase() === headerName.toLowerCase());
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
        return this.findRequestHeader(subscriptionKeyHeaderName);
    }

    private isTraceHeaderSpecified(): boolean {
        return !!this.findRequestHeader(KnownHttpHeaders.OcpApimTrace);
    }

    private setSubscriptionKeyHeader(): ConsoleHeader {
        const subscriptionKeyHeaderName = this.getSubscriptionKeyHeaderName();
        const subscriptionKeyHeader = this.getSubscriptionKeyHeader();

        const headerIndex = this.consoleOperation().request.headers.indexOf(subscriptionKeyHeader);

        if (headerIndex >= 0) {
            this.consoleOperation().request.headers.splice(headerIndex, 1);
        }

        const keyHeader = new ConsoleHeader();
        keyHeader.name(subscriptionKeyHeaderName);
        keyHeader.value(this.selectedSubscriptionKey);
        keyHeader.description = "Subscription key.";
        keyHeader.secret = true;
        keyHeader.inputTypeValue = "password";
        keyHeader.type = "string";
        keyHeader.required = false;

        this.consoleOperation().request.headers.push(keyHeader);

        return keyHeader;
    }

    private isSubscriptionKeyHeaderSpecified(): boolean {
        const header = this.getSubscriptionKeyHeader();

        return header && !!header.value;
    }

    private setAuthorizationHeader(accessToken: string): ConsoleHeader {
        // TODO: Update @paperbits/core to enable native .remove();
        _.remove(<any>this.consoleOperation().request.headers, header => (<any>header).name().toLowerCase() === KnownHttpHeaders.Authorization.toLowerCase());

        const header = new ConsoleHeader();
        header.name(KnownHttpHeaders.Authorization);
        header.value(accessToken);
        header.description = "Access token.";
        header.secret = true;
        header.type = "string";
        header.required = true;

        this.consoleOperation().request.headers.push(header);

        return header;
    }

    public updateRequestSummary(): void {
        const urlTemplate = this.consoleOperation().requestUrl();
        let requestSummary = `${this.consoleOperation().method} ${urlTemplate} HTTP/1.1\n`;

        requestSummary += `\n${KnownHttpHeaders.Host}: ${this.consoleOperation().host.hostname}`;

        this.consoleOperation().request.headers().forEach(header => {
            if (header.name && header.value()) {

                let value = header.value();

                if (header.secret && !this.requestSummarySecretsRevealed) {
                    value = value.replace(/./g, "•");
                }

                requestSummary += `\n${header.name}: ${value}`;
            }
        });

        let requestBody = "";

        switch (this.consoleOperation().request.bodyFormat) {
            case "raw":
                requestBody = this.consoleOperation().request.body();
                break;

            case "binary":
                if (this.consoleOperation().request.binary) {
                    requestBody = `[ ${this.consoleOperation().request.binary.name} ]`;
                }
                break;

            default:
                throw new Error("Unknown body format.");
        }

        if (requestBody) {
            requestSummary += `\n\n${requestBody}`;
        }

        this.requestSummary(requestSummary)
    }

    public async validateAndSendRequest(): Promise<void> {
        // if (!await this.validator.validate(this.consoleOperation)) {
        //     return;
        // }

        this.sendRequest();
    }

    public isKeyProvidedByUser(): boolean {
        const keyInHeader = this.consoleOperation().request.headers().find(header => header.name().toLowerCase() === KnownHttpHeaders.OcpApimSubscriptionKey.toLowerCase());
        const keyInQuery = this.consoleOperation().request.queryParameters().find(queryParam => queryParam.name.toLowerCase() === KnownHttpHeaders.OcpApimSubscriptionKey.toLowerCase());
        if (keyInHeader || keyInQuery) {
            this.selectedProduct = undefined;
            return true;
        }
        return false;
    }

    private async sendRequest(): Promise<void> {
        this.consoleTraceError(null);
        this.working = true;
        this.responseStatusCode(null);

        const url = `${this.consoleOperation().requestUrl()}`;
        const method = this.consoleOperation().method;
        let headers = [...this.consoleOperation().request.headers()];

        if (this.isConsumptionMode) {
            const traceHeaderIndex = headers.findIndex(header => header.name().toLowerCase() === KnownHttpHeaders.OcpApimTrace.toLowerCase());
            traceHeaderIndex !== -1 && headers.splice(traceHeaderIndex, 1);

            let traceHeader = this.consoleOperation().createHeader(KnownHttpHeaders.OcpApimTrace, "true", "bool", "Enable request tracing.");

            if (this.isKeyProvidedByUser()) {
                traceHeader.value(this.masterKey);
            }
            else {
                let keyHeader = this.consoleOperation().createHeader(KnownHttpHeaders.OcpApimSubscriptionKey, this.masterKey, "string", "Subscription key.");

                if (this.selectedProduct) {
                    keyHeader.value(`${keyHeader.value};product=${this.selectedProduct}`);
                }
                headers.push(keyHeader);
            }

            headers.push(traceHeader);
        }

        let payload;

        switch (this.consoleOperation().request.bodyFormat) {
            case "raw":
                payload = this.consoleOperation().request.body;
                break;

            case "binary":
                const formData = new FormData();
                formData.append(this.consoleOperation().request.binary.name, this.consoleOperation().request.binary);
                payload = formData;
                break;

            default:
                throw new Error("Unknown body format.");
        }

        try {
            const request: HttpRequest = {
                url: url.replace("proxy.host.name", "aztest.azure-api.net"),
                method: method,
                headers: headers.map(x => { return { name: x.name(), value: x.value() } }),
                body: payload
            }
            const response = await this.httpClient.send(request);

            this.responseHeadersString(response.headers.map(x => `${x.name}: ${x.value}`).join("\n"));

            const knownStatusCode = KnownStatusCodes.find(x => x.code === response.statusCode);

            let responseStatusText;

            if (knownStatusCode) {
                responseStatusText = knownStatusCode.description;
            }
            else {
                responseStatusText = "Unknown";
            }

            this.responseStatusCode(response.statusCode.toString());
            this.responseStatusText(responseStatusText);

            this.responseBody(response.toText());

            const responseHeaders = response.headers.map(x => {
                const consoleHeader = new ConsoleHeader();
                consoleHeader.name(x.name);
                consoleHeader.value(x.value);
                return consoleHeader;
            });

            if (this.isTraceHeaderSpecified()) {
                if (!this.isSubscriptionKeyHeaderSpecified()) {
                    this.consoleTraceError("Trace is not available for requests with no subscription key specified.");
                }
                else {
                    this.checkTraces(responseHeaders);
                }
            }

            const contentTypeHeader = responseHeaders.find((header) => header.name().toLowerCase() === KnownHttpHeaders.ContentType.toLowerCase());

            if (contentTypeHeader) {
                if (contentTypeHeader.value().toLowerCase().indexOf("json") >= 0) {
                    this.responseContentType = "json";
                    this.responseBody(Utils.formatJson(this.responseBody()));
                }
                if (contentTypeHeader.value().toLowerCase().indexOf("xml") >= 0) {
                    this.responseContentType = "xml";
                    this.responseBody(Utils.formatXml(this.responseBody));
                }
            }
        }
        finally {
            this.working = false;
        }
    }

    public parseTime(time: string): number {
        const match = time.match(/(\d\d?):(\d\d?):(\d\d?)(\.\d+)/);
        return match ? +(1000 * (60 * (60 * +match[1] + +match[2]) + +match[3] + +match[4])) : null;
    }

    public formatJson(data): string {
        return JSON.stringify(data, null, 4);
    }

    private checkTraces(headers: ConsoleHeader[]): void {
        const traceHeader = headers.find((header) => header.name().toUpperCase() === KnownHttpHeaders.OcpApimTraceLocation.toUpperCase());

        if (traceHeader && traceHeader.value) {
            this.downloadTraces(traceHeader.value());
        }
        else {
            this.consoleTraceError(`Trace is not available because response does not contain ${KnownHttpHeaders.OcpApimTraceLocation} header.`);
        }
    }

    private async downloadTraces(traceUrl: string): Promise<void> {
        try {
            const request: HttpRequest = {
                url: traceUrl,
                method: "GET"
            }

            /**
             * TODO: Add retriable send to http client.
             * Traces may not be available with first 2-4 requests.
             */
            const result = await this.httpClient.send<Trace>(request);
            const trace = result.toObject();
            const traceId = Utils.getQueryParams(traceUrl.split("?", 2)[1])["traceId"];

            if (trace.traceId !== traceId) {
                throw new Error("traceId mismatch");
            }

            this.consoleTrace(new ConsoleTrace(trace));
        }
        catch (error) {
            this.consoleTrace(null);
            this.consoleTraceError("Could not load trace due to error. Please try again later.");
        }
    }

    public toggleRequestSummarySecrets(): void {
        this.requestSummarySecretsRevealed = !this.requestSummarySecretsRevealed;
    }

    public selectMessageTab(): void {
        this.responseActiveTab("message");
    }

    public selectTraceTab(): void {
        this.responseActiveTab("trace");
    }
}