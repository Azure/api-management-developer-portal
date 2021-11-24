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
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;
    public totalNoOfItems: ko.Observable<number>;   //pagination changes

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
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable(false);
        this.hasNextPage = ko.observable(false);
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
        this.totalNoOfItems = ko.observable();  //pagination changes
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
            this.totalNoOfItems(itemsPage.count);  //pagination changes
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

     //Get total page count - pagination changes
     public getPageTotal() : number {
        var totalPages = Math.ceil(this.totalNoOfItems() / Constants.defaultPageSize);
        if (this.page() > totalPages && totalPages > 0) {
            this.page(totalPages);
        }
        return totalPages
    }

    //Navigate to page number - pagination changes
    public changePageTo(newPage:string) {
        return function() {
          switch (newPage) {
            case "last":
                this.page(this.getPageTotal());
              break;
            case "first":
                this.page(1);
              break;
            default:
                this.page(newPage);
          }
          this.loadPageOfProducts();
        }
    }

    //Change page by - pagination changes
    public changePageBy(offset){
        return function() {
            this.page(this.page() + offset);
            this.loadPageOfProducts();
        }
    }

    public selectFirstProduct(): void {
        let productName;
        const products = this.products();
        productName = products[0].name;

        this.selectedProductName(productName);

        const productUrl = this.routeHelper.getProductReferenceUrl(productName, this.detailsPageUrl());
        this.router.navigateTo(productUrl);
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, this.detailsPageUrl());
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