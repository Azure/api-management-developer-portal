import * as ko from "knockout";
import template from "./product-details.html";
import { Router, Route } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";

@RuntimeComponent({ selector: "product-details-runtime" })
@Component({
    selector: "product-details-runtime",
    template: template,
    injectable: "productDetails"
})
export class ProductDetails {
    public readonly product: ko.Observable<Product>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.product = ko.observable();
        this.working = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {

        this.router.addRouteChangeListener(this.onRouteChange);

        const route = this.router.getCurrentRoute();
        const productId = this.getProductId(route);
        await this.loadProduct(productId);
    }

    private onRouteChange(route: Route): void {
        const productId = this.getProductId(route);
        this.loadProduct(productId);
    }

    private getProductId(route: Route): string {
        const queryParams = new URLSearchParams(route.hash || (route.url.indexOf("?") !== -1 ? route.url.split("?").pop() : ""));
        const productId = queryParams.get("productId");

        return productId;
    }

    private async loadProduct(productId: string): Promise<void> {
        if (!productId) {
            return;
        }

        this.working(true);
        this.product(null);

        try {
            const product = await this.productService.getProduct("/products/" + productId);

            if (product) {
                this.product(product);
            }
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            if (error.code === "ResourceNotFound") {
                return;
            }

            // TODO: Uncomment when API is in place:
            // this.notify.error("Oops, something went wrong.", "We're unable to add subscription. Please try again later.");

            throw error;
        }
        finally {
            this.working(false);
        }
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}