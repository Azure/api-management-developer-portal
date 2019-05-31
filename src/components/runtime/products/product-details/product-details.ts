import * as ko from "knockout";
import template from "./product-details.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../models/api";
import { Product } from "../../../../models/product";
import { Subscription } from "../../../../models/subscription";
import { SubscriptionState } from "../../../../contracts/subscription";
import { ProductService } from "../../../../services/productService";
import { UsersService } from "../../../../services/usersService";
import { ApiService } from "../../../../services/apiService";

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
    
    public showSubscribe: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.product = ko.observable();
        
        this.apis = ko.observableArray();
        this.subscriptions = ko.observableArray();
        this.showSubscribe = ko.observable(false);
        this.working = ko.observable(true);

        this.routeHandler.addRouteChangeListener(this.initialize.bind(this));
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        // this.currentUrl = this.routeHandler.getCurrentUrl().replace(/\/$/, "");

        // const hash = this.routeHandler.getHash();

        // if (!hash) {
        //     return;
        // }

        // this.working(true);
        
        // const productId = "/products/" + hash;

        // if (!this.product() || this.product().id !== productId) {
        //     const product = await this.productService.getProduct(productId);

        //     if (product) {
        //         this.product(product);

        //         const userId = this.usersService.getCurrentUserId();

        //         if (userId) {
        //             await this.loadSubscriptions(userId);
        //         }
        //     }
        // }

        this.working(false);
    }

    private async loadSubscriptions(userId: string): Promise<void> {
        if (!userId) {
            return;
        }
        const subscriptions = await this.productService.getUserSubscriptions(userId);
        const productSubscriptions = subscriptions.filter(item => item.productId === this.product().id && item.state === SubscriptionState.active) || [];
        this.subscriptions(productSubscriptions);
        
    }

    

    public selectApi(api: Api): void {
        // location.assign(api.id);
        location.assign("/apis");
    }

    public selectSubscription(product: Product): void {
        location.assign("/profile");
    }

    public toggleSubscribe(): void {
        this.showSubscribe(false);
    }
}