import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./api-products.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../services/apiService";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Product } from "../../../../../models/product";

@RuntimeComponent({
    selector: "api-products-runtime"
})
@Component({
    selector: "api-products-runtime",
    template: template
})
export class ApiProducts {
    public readonly products: ko.ObservableArray<Product>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;
    private lastPattern: string;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.products = ko.observableArray([]);
        this.selectedApiName = ko.observable();
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (apiName) {
            this.selectedApiName(apiName);
            await this.loadPageOfProducts();
        }

        this.router.addRouteChangeListener(this.onRouteChange);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchProducts);

        this.pageNumber.subscribe(this.loadPageOfProducts);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || (apiName === this.selectedApiName() && this.lastPattern === this.pattern())) {
            return;
        }

        this.selectedApiName(apiName);
        await this.loadPageOfProducts();
    }

    /**
     * Initiates searching products.
     */
    public async searchProducts(): Promise<void> {
        this.pageNumber(1);
        await this.loadPageOfProducts();
    }

    /**
     * Loads page of products.
     */
    public async loadPageOfProducts(): Promise<void> {
        const pageNumber = this.pageNumber() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        try {
            this.working(true);
            const apiName = this.selectedApiName();
            const pageOfProducts = await this.apiService.getApiProductsPage(apiName, query);
            this.lastPattern = this.pattern();
            this.products(pageOfProducts.value);
            this.nextPage(!!pageOfProducts.nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load API products. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, this.detailsPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchProducts);
    }
}