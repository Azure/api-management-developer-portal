import * as ko from "knockout";
import template from "./product-subscriptions.html";
import { Subscription } from "../../../../models/subscription";
import { RouteHandler } from "@paperbits/common/routing";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { ProductService } from "../../../../services/productService";
import { UsersService } from "../../../../services/usersService";

@RuntimeComponent({ selector: "product-subscriptions-runtime" })
@Component({
    selector: "product-subscriptions-runtime",
    template: template,
    injectable: "productSubscriptions"
})
export class ProductSubscriptions {
    public readonly working: ko.Observable<boolean>;
    public readonly subscriptions: ko.ObservableArray<Subscription>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly routeHandler: RouteHandler
    ) {
        this.working = ko.observable();
        this.subscriptions = ko.observableArray();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.usersService.ensureSignedIn();
        await this.loadProductSubscriptions();
        this.routeHandler.addRouteChangeListener(this.loadProductSubscriptions);
    }

    private getProductId(): string {
        const route = this.routeHandler.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : null;
    }

    private async loadProductSubscriptions(): Promise<void> {
        try {
            this.working(true);

            const productId = this.getProductId();

            if (!productId) {
                return;
            }

            const userId = this.usersService.getCurrentUserId();
            const subscriptions = await this.productService.getSubscriptionsForProduct(userId, productId);
            this.subscriptions(subscriptions);
        }
        catch (error) {
            // Notify user?
            debugger;
        }
        finally {
            this.working(false);
        }
    }
}