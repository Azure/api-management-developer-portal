import * as ko from "knockout";
import template from "./product-details.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { getUrlHashPart } from "@paperbits/common/utils";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
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

        this.loadProduct = this.loadProduct.bind(this);
        this.selectApi = this.selectApi.bind(this);
        this.selectSubscription = this.selectSubscription.bind(this);
        this.subscribeToProduct = this.subscribeToProduct.bind(this);
        this.routeHandler.addRouteChangeListener(this.loadProduct);
    }

    @OnMounted()
    public async loadProduct(): Promise<void> {
        this.currentUrl = this.routeHandler.getCurrentUrl().replace(/\/$/, "");        

        const hash = getUrlHashPart(this.currentUrl);
        if (hash) {
            const productId = "/products/"+ hash;
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
        }
        
    }

    private async loadSubscriptions(userId: string): Promise<void> {
        if (userId) {
            const subscriptions = await this.productService.getUserSubscriptions(userId);
            const productSubscriptions = subscriptions.filter(item => item.productId === this.product().id && item.state === SubscriptionState.active) || [];
            this.subscriptions(productSubscriptions);
            this.calculateSubscriptionsLimit(productSubscriptions);
        }
    }

    private calculateSubscriptionsLimit(productSubscriptions: Subscription[]) {
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

    public toggleSubscribe() {
        this.showSubscribe(false);
    }
}