import * as ko from "knockout";
import template from "./product-details.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { getUrlHashPart } from "@paperbits/common/utils";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Api } from "../../../models/api";
import { Product } from "../../../models/product";
import { Subscription } from "../../../models/subscription";
import { SubscriptionState } from "../../../contracts/subscription";
import { ProductService } from "../../../services/productService";
import { UsersService } from "../../../services/usersService";
import { ApiService } from "../../../services/apiService";

@RuntimeComponent({ selector: "product-details" })
@Component({
    selector: "product-details",
    template: template,
    injectable: "productDetails"
})
export class ProductDetails {
    private currentUrl: string;

    public apis: ko.ObservableArray<Api>;
    public product: ko.Observable<Product>;
    public subscriptions: ko.ObservableArray<Subscription>;
    public limitReached: ko.Observable<boolean>;
    public showSubscribe: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.product = ko.observable();
        this.limitReached = ko.observable();
        this.apis = ko.observableArray();
        this.subscriptions = ko.observableArray();
        this.showSubscribe = ko.observable(false);
        this.working = ko.observable(true);

        this.routeHandler.addRouteChangeListener(this.loadProduct.bind(this));
    }

    @OnMounted()
    public async loadProduct(): Promise<void> {
        this.currentUrl = this.routeHandler.getCurrentUrl().replace(/\/$/, "");

        const hash = this.routeHandler.getHash();

        if (!hash) {
            return;
        }

        this.working(true);
        
        const productId = "/products/" + hash;

        if (!this.product() || this.product().id !== productId) {
            const product = await this.productService.getProduct(productId);

            if (product) {
                this.product(product);

                const apis = await this.apiService.getProductApis(productId);

                if (apis) {
                    this.apis(apis || []);
                }

                const userId = this.usersService.getCurrentUserId();

                if (userId) {
                    await this.loadSubscriptions(userId);
                }
            }
        }

        this.working(false);
    }

    private async loadSubscriptions(userId: string): Promise<void> {
        if (!userId) {
            return;
        }
        const subscriptions = await this.productService.getUserSubscriptions(userId);
        const productSubscriptions = subscriptions.filter(item => item.productId === this.product().id && item.state === SubscriptionState.active) || [];
        this.subscriptions(productSubscriptions);
        this.calculateSubscriptionsLimit(productSubscriptions);
    }

    private calculateSubscriptionsLimit(productSubscriptions: Subscription[]): void {
        const product = this.product();

        const activeCount = productSubscriptions.filter(item => item.state === SubscriptionState.active).length;
        let isLimitReached = false;

        if (product.allowMultipleSubscriptions) {
            if ((product.subscriptionsLimit || product.subscriptionsLimit === 0) && activeCount >= product.subscriptionsLimit) {
                isLimitReached = true;
            }
        }
        else {
            if (activeCount === 1) {
                isLimitReached = true;
            }
        }
        this.limitReached(isLimitReached);
    }

    public selectApi(api: Api): void {
        // location.assign(api.id);
        location.assign("/apis");
    }

    public selectSubscription(product: Product): void {
        location.assign("/profile");
    }

    public subscribeToProduct(): void {
        this.showSubscribe(true);
    }

    public toggleSubscribe(): void {
        this.showSubscribe(false);
    }
}