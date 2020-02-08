import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-list-dropdown.html";
import { Component, RuntimeComponent, OnMounted, Param, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { ProductService } from "../../../../../services/productService";
import { Product } from "../../../../../models/product";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";


@RuntimeComponent({
    selector: "product-list-dropdown-runtime"
})
@Component({
    selector: "product-list-dropdown-runtime",
    template: template
})
export class ProductListDropdown {
    public readonly products: ko.ObservableArray<Product>;
    public readonly working: ko.Observable<boolean>;
    public readonly selectedId: ko.Observable<string>;
    public readonly selectedProduct: ko.Observable<Product>;
    public readonly selectedProductName: ko.Observable<string>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public readonly expanded: ko.Observable<boolean>;
    public readonly selection: ko.Computed<string>;

    constructor(
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.working = ko.observable();
        this.selectedId = ko.observable();
        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable();
        this.hasNextPage = ko.observable();
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.products = ko.observableArray();
        this.selectedProduct = ko.observable();
        this.selectedProductName = ko.observable();
        this.expanded = ko.observable(false);
        this.selection = ko.computed(() => {
            const product = ko.unwrap(this.selectedProduct);
            return product ? product.displayName : "Select product";
        });
    }

    @Param()
    public readonly allowSelection: ko.Observable<boolean>;

    @Param()
    public readonly detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    /**
     * Initiates searching Products.
     */
    public async resetSearch(): Promise<void> {
        this.page(1);
        this.loadPageOfProducts();
    }

    private async onRouteChange(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (productName !== this.selectedProductName()) {
            await this.resetSearch();
            return;
        }

        await this.resetSearch();
    }

    /**
     * Loads page of Products.
     */
    public async loadPageOfProducts(): Promise<void> {
        try {
            this.working(true);

            const pageNumber = this.page() - 1;

            const query: SearchQuery = {
                pattern: this.pattern(),
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            const itemsPage = await this.productService.getProductsPage(query);

            this.products(itemsPage.value);
            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!itemsPage.nextLink);

            const productName = this.routeHelper.getProductName();

            this.selectedProduct(productName
                ? itemsPage.value.find(item => item.id.endsWith(productName))
                : itemsPage.value[0]);
        }
        catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadPageOfProducts();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadPageOfProducts();
    }

    public toggle(): void {
        this.expanded(!this.expanded());
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, this.detailsPageUrl());
    }
    
    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}