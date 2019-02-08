import * as ko from "knockout";
import template from "./product-list.html";
import { getUrlHashPart } from "@paperbits/common/utils";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Product } from "../../../models/product";
import { ProductService } from "../../../services/productService";
import { Component } from "@paperbits/common/ko/decorators";
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
    public products: KnockoutObservableArray<Product>;
    public showDetails: KnockoutObservable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.products = ko.observableArray();
        this.showDetails = ko.observable(false);
        this.loadProducts = this.loadProducts.bind(this);
        this.selectProduct = this.selectProduct.bind(this);
        this.routeHandler.addRouteChangeListener(this.loadProducts);
        
        this.loadProducts();
    }

    private async loadProducts(): Promise<void> {
        const data = await this.productService.getProducts();       
        this.products(data);
        this.checkIsDetails();
    }

    private checkIsDetails() {
        this.currentUrl = this.routeHandler.getCurrentUrl().replace(/\/$/, "");

        const hash = getUrlHashPart(this.currentUrl);
        if (hash) {
            const productId = "/products/"+ hash;
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
            
            this.routeHandler.navigateTo(`${this.currentUrl}#${parts[parts.length-1]}`);
        }
        this.showDetails(true);
    }

    public toggleDetails() {
        this.routeHandler.navigateTo("/products");
        this.showDetails(false);
    }
}