import * as ko from "knockout";
import template from "./product-details.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { matchUrl } from "@paperbits/common/utils";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Api } from "../../../models/api";
import { Product } from "../../../models/product";
import { Subscription } from "../../../models/subscription";
import { SubscriptionState } from "../../../contracts/subscription";
import { ProductService } from "../../../services/productService";
import { UsersService } from "../../../services/usersService";
import { ApiService } from "../../../services/apiService";

export const urlTemplate = "/products/{id}";
@RuntimeComponent({ selector: "product-details" })
@Component({
    selector: "product-details",
    template: template,
    injectable: "productDetails"
})
export class ProductDetails {

    public apis: KnockoutObservableArray<Api>;
    public product: KnockoutObservable<Product>;    
    public subscriptions: KnockoutObservableArray<Subscription>;
    public limitReached: KnockoutObservable<boolean>;
    public multipleNotAllowed: KnockoutObservable<boolean>;
    public showSubscribe: KnockoutObservable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly apiService: ApiService,
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler
    ) {
        this.product = ko.observable();
        this.limitReached = ko.observable();
        this.multipleNotAllowed = ko.observable();
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
        const route = this.routeHandler.getCurrentUrl();        

        if (route === urlTemplate || decodeURI(route) === urlTemplate) {
            // This is a layout design time 
            return;
        }
        const routeVars = matchUrl(route, urlTemplate);
        if (!routeVars) {
            // This is error
            return;
        }

        const productId = route;
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

    private async loadSubscriptions(userId: string): Promise<void> {
        if (userId) {
            const subscriptions = await this.productService.getUserSubscriptions(userId);
            const productSubscriptions = subscriptions.filter(item => item.productId === this.product().id && item.state === SubscriptionState.active) || [];
            this.subscriptions(productSubscriptions);
            const product = this.product();
            const activeCount = productSubscriptions.filter(item => item.state === SubscriptionState.active).length;
            this.limitReached(product.allowMultipleSubscriptions && product.subscriptionsLimit && activeCount >= product.subscriptionsLimit);
            this.multipleNotAllowed(!product.allowMultipleSubscriptions && activeCount > 0);
        }
    }

    public selectApi(api: Api): void {
        location.assign(api.id);
    }

    public selectSubscription(product: Product): void {
        location.assign("/profile");
    }

    public subscribeToProduct(): void {
        this.routeHandler.navigateTo(`${this.product().id}/subscribe`);
        this.showSubscribe(true);
    }

    public toggleDetails() {
        this.routeHandler.navigateTo(this.product().id);
        this.showSubscribe(false);
    }
}