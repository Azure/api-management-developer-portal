import * as ko from "knockout";
import template from "./product-list.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../../../utils";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";


@RuntimeComponent({ selector: "product-list-runtime" })
@Component({
    selector: "product-list-runtime",
    template: template,
    injectable: "productList"
})
export class ProductList {
    public readonly selectedProductId: ko.Observable<string>;
    public readonly products: ko.ObservableArray<Product>;
    public readonly showDetails: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.products = ko.observableArray();
        this.selectedProductId = ko.observable();
        this.working = ko.observable(true);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.usersService.ensureSignedIn();
        await this.loadProducts();

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    private async loadProducts(): Promise<void> {
        try {
            this.working(true);
            const products = await this.productService.getProducts();

            this.products(products);

            let productId = this.getProductId();

            if (productId) {
                this.selectedProductId(`/products/${productId}`);
            }
            else if (products.length > 0) {
                productId = products[0].id;
                this.selectProduct(productId);
            }
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

    private getProductId(): string {
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        return productId;
    }

    private onRouteChange(): void {
        const productId = this.getProductId();

        if (!productId) {
            return;
        }

        this.selectedProductId(`/products/${productId}`);
    }

    private selectProduct(productId: string): void {
        const productName = Utils.getResourceName("products", productId);
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash);

        queryParams.set("productId", productName);

        this.router.navigateTo("#?" + queryParams.toString());
    }

    public getProductUrl(product: Product): string {
        return product.id.replace("/products/", "#?productId=");
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }    
}