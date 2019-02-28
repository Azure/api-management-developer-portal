import * as ko from "knockout";
import template from "./product-list.html";
import { getUrlHashPart } from "@paperbits/common/utils";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Product } from "../../../models/product";
import { ProductService } from "../../../services/productService";
import { IRouteHandler } from "@paperbits/common/routing";

@RuntimeComponent({ selector: "product-list" })
@Component({
    selector: "product-list",
    template: template,
    injectable: "productList"
})
export class ProductList {
    private currentUrl: string;
    private selected: Product;
    public products: ko.ObservableArray<Product>;
    public showDetails: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.products = ko.observableArray();
        this.showDetails = ko.observable(false);
        this.working = ko.observable(true);
    }

    @OnMounted()
    public async loadProducts(): Promise<void> {
        this.working(true);
        const data = await this.productService.getProducts();
        this.products(data);
        this.checkIsDetails();

        this.working(false);

        this.routeHandler.addRouteChangeListener(this.loadProducts);
    }

    private checkIsDetails() {
        this.currentUrl = this.routeHandler.getCurrentUrl().replace(/\/$/, "");

        const hash = getUrlHashPart(this.currentUrl);
        if (hash) {
            const productId = "/products/" + hash;
            if (!this.selected || this.selected.id !== productId) {
                const loadedProducts = this.products();
                const product = loadedProducts.find(p => p.id === productId);
                this.selectProduct(product, false);
            }
        } else {
            this.showDetails(false);
        }
    }

    public selectProduct(product: Product, needNavigation = true) {
        this.selected = product;
        if (needNavigation) {
            const parts = product.id.split("/");

            this.routeHandler.navigateTo(`${this.currentUrl}#${parts[parts.length - 1]}`);
        }
        this.showDetails(true);
    }

    public toggleDetails() {
        this.routeHandler.navigateTo("/products");
        this.showDetails(false);
    }
}