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

     //-----pagination changes start ---------------------------- 
     public pageCount() {
        return Math.ceil(this.totalNoOfItems() / Constants.defaultPageSize);
    };

    public setCurrentPag(page) {
        if (page < Constants.firstPage)
            page = Constants.firstPage;

        if (page > this.lastPage())
            page = this.lastPage();

        this.page(page);
    };


    public lastPage() {
        return this.pageCount();
    };

    public nextPagePresent() {
        var next = this.page() + 1;
        if (next > this.lastPage())
            return null;
        return next;
    };

    public previousPage () {
        var previous = this.page() - 1;
        if (previous < Constants.firstPage)
            return null;

        return previous;
    };

    public needPaging() {
        return this.pageCount() > 1;
    };

    public nextPageActive() {
        return this.nextPagePresent() != null;
    };

    public previousPageActive() {
        return this.previousPage() != null;
    };

    public lastPageActive() {
        return (this.lastPage() != this.page());
    };

    public firstPageActive() {
        return (Constants.firstPage != this.page());
    };

    public generateAllPages() {
        var pages = [];
        for (var i = Constants.firstPage; i <= this.lastPage() ; i++)
            pages.push(i);

        return pages;
    };

    public generateMaxPage() {
        var current  = this.page();
        var pageCount = this.pageCount();
        var first = Constants.firstPage;

        var upperLimit = current + (Constants.maxPageCount - 1) / 2;
        var downLimit = current - (Constants.maxPageCount - 1) / 2;

        while (upperLimit > pageCount) {
            upperLimit--;
            if (downLimit > first)
                downLimit--;
        }

        while (downLimit < first) {
            downLimit++;
            if (upperLimit < pageCount)
                upperLimit++;
        }

        var pages = [];
        for (var i = downLimit; i <= upperLimit; i++) {
            pages.push(i);
        }
        return pages;
    };

    public getPages() {
        this.page();
        this.totalNoOfItems();

        if (this.pageCount() <= Constants.maxPageCount) {
            return ko.observableArray(this.generateAllPages());
        } else {
            return ko.observableArray(this.generateMaxPage());
        }
    };

    public goToPage(page) {
        if (page >= Constants.firstPage && page <= this.lastPage())
        this.page(page);
        this.loadPageOfProducts();
    }

    public goToFirst() {
        this.page(Constants.firstPage);
        this.loadPageOfProducts();
    };

    public goToPrevious() {
        var previous = this.previousPage();
        if (previous != null)
        this.page(previous);
        this.loadPageOfProducts();
    };

    public goToNext() {
        var next = this.nextPagePresent();
        if (next != null)
        this.page(next);
        this.loadPageOfProducts();
    };

    public goToLast() {
        this.page(this.lastPage());
        this.loadPageOfProducts();
    };

    //------pagination changes end ---------------------------

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