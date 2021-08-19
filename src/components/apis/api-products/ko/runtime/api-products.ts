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
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
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
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        if (apiName) {
            this.selectedApiName(apiName);
            await this.loadData();
        }

        this.router.addRouteChangeListener(this.onRouteChange);

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchProducts);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || (apiName === this.selectedApiName() && this.lastPattern === this.pattern())) {
            return;
        }

        this.selectedApiName(apiName);
        await this.loadData();
    }

    /**
     * Initiates searching products.
     */
    public async searchProducts(): Promise<void> {
        this.page(1);
        await this.loadData();
    }

    /**
     * Loads page of products.
     */
    public async loadData(): Promise<void> {

        const pageNumber = this.page() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        try {
            this.working(true);
            const apiName = this.selectedApiName();
            const itemsPage = await this.apiService.getApiProductsPage(apiName, query);
            this.lastPattern = this.pattern();
            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!itemsPage.nextLink);
            this.products(itemsPage.value);
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

    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadData();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadData();
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchProducts);
    }
}