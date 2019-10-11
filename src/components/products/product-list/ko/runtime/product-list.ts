import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-list.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { SearchQuery } from "../../../../../contracts/searchQuery";

@RuntimeComponent({ selector: "product-list" })
@Component({
    selector: "product-list",
    template: template,
    injectable: "productList"
})
export class ProductList {
    public readonly products: ko.ObservableArray<Product>;
    public readonly showDetails: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    public readonly pattern: ko.Observable<string>;    
    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    private lastPattern;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.products = ko.observableArray();
        this.working = ko.observable(true);

        this.pattern = ko.observable();
        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable(false);
        this.hasNextPage = ko.observable(false);
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchByName();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.searchByName);
    }

    public getProductUrl(product: Product): string {
        return product.id.replace("/products/", `${Constants.productReferencePageUrl}#?productId=`);
    }

    public async searchByName(): Promise<void> {
        const currentPattern = this.pattern();
        if (this.lastPattern !== currentPattern) {
            this.page(1);
        }

        const pageNumber = this.page() - 1;
        const query: SearchQuery = {
            pattern: this.pattern(),
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        this.working(true);

        try {
            const itemsPage = await this.productService.getProductsPage(query);

            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!itemsPage.nextLink);

            this.lastPattern = query.pattern;
            this.products(itemsPage.value);

        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            // TODO: Uncomment when API is in place:
            // this.notify.error("Oops, something went wrong.", "We're unable to load products. Please try again later.");

            throw error;
        }
        finally {
            this.working(false);
        }
    }

    public prevPage(): void {
        this.page(this.page() - 1);
        this.searchByName();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.searchByName();
    }
}