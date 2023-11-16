import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-list.html";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
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
    template: template
})
export class ProductList {
    public readonly products: ko.ObservableArray<Product>;
    public readonly selectedProductName: ko.Observable<string>;
    public readonly showDetails: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly pattern: ko.Observable<string>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.products = ko.observableArray();
        this.selectedProductName = ko.observable().extend(<any>{ acceptChange: this.allowSelection });
        this.working = ko.observable(true);
        this.pattern = ko.observable();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.pageNumber.subscribe(this.loadPageOfProducts);
    }

    public async loadPageOfProducts(): Promise<void> {
        const pageNumber = this.pageNumber() - 1;

        const query: SearchQuery = {
            pattern: this.pattern(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        try {
            this.working(true);

            const pageOfProducts = await this.productService.getProductsPage(query);
            this.products(pageOfProducts.value);
            this.nextPage(!!pageOfProducts.nextLink);

            if (this.allowSelection() && !this.selectedProductName()) {
                this.selectFirstProduct();
            }
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            throw new Error(`Unable to load products. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public selectFirstProduct(): void {
        const products = this.products();
        const productName = products[0].name;

        this.selectedProductName(productName);

        const productUrl = this.routeHelper.getProductReferenceUrl(productName, this.detailsPageUrl());
        this.router.navigateTo(productUrl);
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, this.detailsPageUrl());
    }

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadPageOfProducts();
    }
}