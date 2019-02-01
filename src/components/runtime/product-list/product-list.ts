import * as ko from "knockout";
import template from "./product-list.html";
import { matchUrl } from "@paperbits/common/utils";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Product } from "../../../models/product";
import * as ProductDetails from "../product-details/product-details";
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
    public products: KnockoutObservableArray<Product>;
    public showDetails: KnockoutObservable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.products = ko.observableArray();
        this.showDetails = ko.observable(false);
        this.selectProduct = this.selectProduct.bind(this);
        this.loadProducts();
    }

    private async loadProducts(): Promise<void> {
        const data = await this.productService.getProducts();       
        this.products(data);
        await this.checkIsDetails();
    }

    private async checkIsDetails() {
        const route = this.routeHandler.getCurrentUrl();        

        if (route === ProductDetails.urlTemplate || decodeURI(route) === ProductDetails.urlTemplate) {
            // This is a layout design time 
            return;
        }
        const routeVars = matchUrl(route, ProductDetails.urlTemplate);
        if (routeVars) {
            const productId = route;
            const product = await this.productService.getProduct(productId);
            this.selectProduct(product);
        }
    }

    public selectProduct(product: Product) {
        this.routeHandler.navigateTo(product.id);
        this.showDetails(true);
    }

    public toggleDetails() {
        this.routeHandler.navigateTo("/products");
        this.showDetails(false);
    }
}