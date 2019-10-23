import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-list.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing/router";


@RuntimeComponent({
    selector: "product-list-runtime"
})
@Component({
    selector: "product-list-runtime",
    template: template,
    injectable: "productList"
})
export class ProductList {
    public readonly products: ko.ObservableArray<Product>;
    public readonly selectedProductName: ko.Observable<string>;
    public readonly showDetails: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.products = ko.observableArray();
        this.selectedProductName = ko.observable();
        this.working = ko.observable(true);
        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable(false);
        this.hasNextPage = ko.observable(false);
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);
    }

    public async loadPageOfProducts(): Promise<void> {
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

            if (!this.selectedProductName()) {
                this.selectFirstProduct();
            }
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            throw new Error(`Unable to load products. ${error}`);
        }
        finally {
            this.working(false);
        }
    }

    public selectFirstProduct(): void {
        let productName;
        const products = this.products();
        productName = products[0].name;

        this.selectedProductName(productName);

        const productUrl = this.routeHelper.getProductReferenceUrl(productName);
        this.router.navigateTo(productUrl);
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name);
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadPageOfProducts();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadPageOfProducts();
    }

    public async resetSearch(): Promise<void> {
        this.page(1);
        this.loadPageOfProducts();
    }
}