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
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.products = ko.observableArray([]);
        this.working = ko.observable();
        this.pattern = ko.observable();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
    }

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchProducts);

        this.pageNumber
            .subscribe(this.loadPageOfProducts);
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

            const itemsPage = await this.productService.getProductsPage(query);
            this.products(itemsPage.value);
            this.nextPage(!!itemsPage.nextLink);
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

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadPageOfProducts();
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.searchProducts);
    }
}