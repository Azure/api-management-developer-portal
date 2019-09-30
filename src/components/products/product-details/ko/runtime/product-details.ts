import * as ko from "knockout";
import template from "./product-details.html";
import { Router, Route } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { Product } from "../../../../../models/product";
import { Subscription } from "../../../../../models/subscription";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";

@RuntimeComponent({ selector: "product-details-runtime" })
@Component({
    selector: "product-details-runtime",
    template: template,
    injectable: "productDetails"
})
export class ProductDetails {
    public readonly apis: ko.ObservableArray<Api>;
    public readonly product: ko.Observable<Product>;
    public readonly subscriptions: ko.ObservableArray<Subscription>;
    public readonly showSubscribe: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.product = ko.observable();

        this.apis = ko.observableArray();
        this.subscriptions = ko.observableArray();
        this.showSubscribe = ko.observable(false);
        this.working = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            this.usersService.navigateToSignin();
        }

        this.router.addRouteChangeListener(this.onRouteChange);

        const route = this.router.getCurrentRoute();
        const productId = this.getProductId(route);

        if (!productId) {
            return;
        }

        await this.loadSubscriptions(productId, userId);
        await this.loadProduct(productId);
    }

    private onRouteChange(route: Route): void {
        const productId = this.getProductId(route);
        this.loadProduct(productId);
    }

    private getProductId(route: Route): string {
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        return productId;
    }

    private async loadProduct(productId: string): Promise<void> {
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

    private async loadSubscriptions(productId: string, userId: string): Promise<void> {
        this.subscriptions(null);

        try {
            const subscriptions = await this.productService.getUserSubscriptionsWithProductName(userId);
            const productSubscriptions = subscriptions.filter(item => item.productId === productId && item.state === SubscriptionState.active) || [];

            this.subscriptions(productSubscriptions);
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
    }

    public toggleSubscribe(): void {
        this.showSubscribe(false);
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}