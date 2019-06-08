import * as ko from "knockout";
import template from "./product-details.html";
import { RouteHandler, Route } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../models/api";
import { Product } from "../../../../models/product";
import { Subscription } from "../../../../models/subscription";
import { SubscriptionState } from "../../../../contracts/subscription";
import { ProductService } from "../../../../services/productService";
import { UsersService } from "../../../../services/usersService";

@RuntimeComponent({ selector: "product-details-runtime" })
@Component({
    selector: "product-details-runtime",
    template: template,
    injectable: "productDetails"
})
export class ProductDetails {
    public apis: ko.ObservableArray<Api>;
    public product: ko.Observable<Product>;
    public subscriptions: ko.ObservableArray<Subscription>;
    public showSubscribe: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly routeHandler: RouteHandler
    ) {
        this.product = ko.observable();

        this.apis = ko.observableArray();
        this.subscriptions = ko.observableArray();
        this.showSubscribe = ko.observable(false);
        this.working = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.usersService.ensureSignedIn();

        const route = this.routeHandler.getCurrentRoute();
        const productId = this.getProductId(route);

        if (!productId) {
            return;
        }

        await this.loadSubscriptions(productId);
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

            // TODO: Uncomment when API is in place:
            // this.notify.error("Oops, something went wrong.", "We're unable to add subscription. Please try again later.");
        }
        finally {
            this.working(false);
        }
    }

    private async loadSubscriptions(productId: string): Promise<void> {
        try {
            const userId = await this.usersService.getCurrentUserId();
            const subscriptions = await this.productService.getUserSubscriptions(userId);
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

            console.error(error);

            // TODO: Uncomment when API is in place:
            // this.notify.error("Oops, something went wrong.", "We're unable to add subscription. Please try again later.");
        }
    }

    public toggleSubscribe(): void {
        this.showSubscribe(false);
    }

    public dispose(): void {
        this.routeHandler.removeRouteChangeListener(this.onRouteChange);
    }
}