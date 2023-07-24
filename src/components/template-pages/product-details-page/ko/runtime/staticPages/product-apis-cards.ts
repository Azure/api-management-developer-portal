import * as ko from "knockout"
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import template from "./product-apis-cards.html";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { ApiService } from "../../../../../../services/apiService";
import { Api } from "../../../../../../models/api";

@Component({
    selector: "product-apis-cards",
    template: template
})
export class ProductApisCards {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly selectedProductName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly nextLink: ko.Observable<string>;
    public readonly showQuickView: ko.Observable<boolean>;
    public readonly quickViewApi: ko.Observable<Api>;
    public readonly moreApisLoading: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.apis = ko.observableArray([]);
        this.selectedProductName = ko.observable();
        this.working = ko.observable();
        this.nextLink = ko.observable();
        this.showQuickView = ko.observable(false);
        this.quickViewApi = ko.observable();
        this.moreApisLoading = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (productName) {
            this.selectedProductName(productName);
            await this.loadPageOfApis();
        }

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    public async loadPageOfApis(): Promise<void> {
        try {
            this.working(true);
            const productName = this.selectedProductName();
            const pageOfApis = await this.apiService.getProductApis(`products/${productName}`, {});
            this.apis(pageOfApis.value);
            this.nextLink(pageOfApis.nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load product APIs. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public async loadMoreApis(): Promise<void> {
        try {
            this.moreApisLoading(true);
            const pageOfApis = await this.apiService.getProductApisNextLink(this.nextLink());
            this.apis.push(...pageOfApis.value);
            this.nextLink(pageOfApis.nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load more product APIs. Error: ${error.message}`);
        }
        finally {
            this.moreApisLoading(false);
        }
    }

    public async onRouteChange(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (productName !== this.selectedProductName()) {
            this.selectedProductName(productName);
            await this.loadPageOfApis();
        }
    }

    public async openApiQuickView(api: Api): Promise<void> {
        this.quickViewApi(api);
        this.showQuickView(true);
    }

    public closeApiQuickView(): void {
        this.showQuickView(false);
    }

    public getFullApiUrl(api: ko.Observable<Api>): string {
        return window.location.host + "/" + this.routeHelper.getApiReferenceUrl(api().name, "api-details");
    }

    public getApiUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, "api-details");
    }

}
