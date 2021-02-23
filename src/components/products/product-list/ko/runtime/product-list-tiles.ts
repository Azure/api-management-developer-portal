import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-list-tiles.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";

@RuntimeComponent({
    selector: "product-list-tiles-runtime"
})
@Component({
    selector: "product-list-tiles-runtime",
    template: template
})
export class ProductListTiles {
    public readonly products: ko.ObservableArray<Product>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.products = ko.observableArray([]);
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
        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchProducts);
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

            const itemsPage = await this.productService.getProductsPage(query);
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

    public async resetSearch(): Promise<void> {
        this.page(1);
        this.loadData();
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchProducts);
    }
}