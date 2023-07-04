import * as ko from "knockout";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import template from "./product-details-page.html";
import { Product } from "../../../../../models/product";
import { breadcrumbItem, menuItem } from "../../../common/Utils";
import { ProductService } from "../../../../../services/productService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";


@RuntimeComponent({
    selector: "product-details-page"
})
@Component({
    selector: "product-details-page",
    template: template
})
export class ProductDetailsPage {
    public readonly product: ko.Observable<Product>;
    public readonly breadcrumbItems: ko.Observable<breadcrumbItem[]>;
    public readonly productLoading: ko.Observable<boolean>;
    public readonly selectedMenuItem: ko.Observable<menuItem>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {
        this.product = ko.observable();
        this.breadcrumbItems = ko.observable([]);
        this.productLoading = ko.observable(true);
        this.selectedMenuItem = ko.observable();
        this.wrapText = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.onRouteChange);
        const productName = this.routeHelper.getProductName();

        this.loadProduct(productName);

        this.selectedMenuItem.subscribe((menuItem) => {
            const breadcrumbs = this.breadcrumbItems();
            breadcrumbs.pop();
            breadcrumbs.push({ title: menuItem.displayName, url: "" });
            this.breadcrumbItems(breadcrumbs);
        });
    }

    private async loadProduct(productName: string): Promise<void> {
        this.productLoading(true);
        try {
            const product = await this.productService.getProduct(`products/${productName}`);
            this.product(product);

            this.initializeBreadcrumbItems();
        }
        catch (error) {
            console.error(`Unable to load product: ${error}`);
        }
        finally {
            this.productLoading(false);
        }
    }

    private async onRouteChange(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (!productName || productName === this.product().name) {
            return;
        }

        await this.loadProduct(productName);
    }

    private initializeBreadcrumbItems() {
        const productReferenceUrl = this.routeHelper.getProductReferenceUrl(this.product().name);
        this.breadcrumbItems([{ title: "Home", url: "/" },
        { title: "Products", url: "/products" },
        { title: this.product().name, url: productReferenceUrl },
        { title: "About this Product", url: productReferenceUrl }])
    }
}