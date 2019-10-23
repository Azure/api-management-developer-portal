import * as ko from "knockout";
import template from "./product-details.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { RouteHelper } from "../../../../../routing/routeHelper";

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
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {
        this.product = ko.observable();
        this.working = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const productName = this.routeHelper.getProductName();
        this.router.addRouteChangeListener(this.onRouteChange);

        await this.loadProduct(productName);
    }

    private onRouteChange(): void {
        const productName = this.routeHelper.getProductName();
        this.loadProduct(productName);
    }

    private async loadProduct(productName: string): Promise<void> {
        if (!productName) {
            return;
        }

        this.working(true);
        this.product(null);

        try {
            const product = await this.productService.getProduct("/products/" + productName);

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