import * as ko from "knockout";
import template from "./product-subscribe.html";
import { IRouteHandler, Route } from "@paperbits/common/routing";
import { getUrlHashPart } from "@paperbits/common/utils";
import { Component, OnMounted, RuntimeComponent, Param } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../../utils";
import { Product } from "../../../../models/product";
import { ProductService } from "../../../../services/productService";
import { UsersService } from "../../../../services/usersService";
import { IAuthenticator } from "../../../../authentication/IAuthenticator";
import { Subscription } from "../../../../models/subscription";
import { SubscriptionState } from "../../../../contracts/subscription";

@RuntimeComponent({ selector: "product-subscribe" })
@Component({
    selector: "product-subscribe",
    template: template,
    injectable: "productSubscribe"
})
export class ProductSubscribe {
    private currentUrl: string;

    public readonly working: ko.Observable<boolean>;
    public readonly product: ko.Observable<Product>;
    public readonly showTerms: ko.Observable<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly termsOfUse: ko.Observable<string>;
    public readonly showHideLabel: ko.Observable<string>;
    public readonly showSubscribeForm: ko.Observable<boolean>;
    public readonly subscriptionName: ko.Observable<string>;
    public readonly limitReached: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly routeHandler: IRouteHandler,
        private readonly authenticator: IAuthenticator
    ) {
        this.product = ko.observable();
        this.showTerms = ko.observable();
        this.consented = ko.observable(false);
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.showSubscribeForm = ko.observable(false);
        this.subscriptionName = ko.observable();
        this.limitReached = ko.observable(false);
        this.working = ko.observable(true);
        this.routeHandler.addRouteChangeListener(this.onRouteChange.bind(this));
        // this.consented.subscribe((val) => console.log("consented changed: " + val));
    }

    // @Param()
    // public product: Product;

    private onRouteChange(route: Route): void {
        const productId = this.getProductId(route);
        this.loadProduct(productId);
    }

    private getProductId(route: Route): string {
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        console.log(productId);

        return productId;
    }

    private async loadProduct(productId: string): Promise<void> {
        this.product(null);
        this.working(true);

        const product = await this.productService.getProduct("/products/" + productId);

        if (product) {
            this.product(product);
            this.subscriptionName(product.name);

            if (product.terms) {
                this.termsOfUse(product.terms);
                this.showHideLabel("Show");
                this.showTerms(false);
            }
        }

        // this.loadSubscriptions(userId);

        this.working(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const userId = this.usersService.getCurrentUserId();

        if (!userId && this.usersService.isUserLoggedIn()) {
            location.assign("/signin");
            return;
        }



        const route = this.routeHandler.getCurrentRoute();
        const productId = this.getProductId(route);

        if (!productId) {
            return;
        }

        this.loadSubscriptions(userId, productId);
        this.loadProduct(productId);
    }

    private async loadSubscriptions(userId: string, productId: string): Promise<void> {
        if (!userId) {
            return;
        }
        const subscriptions = await this.productService.getUserSubscriptions(userId);
        const productSubscriptions = subscriptions.filter(item => item.productId === productId && item.state === SubscriptionState.active) || [];

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

    public addSubscription(): void {
        this.showSubscribeForm(true);
    }

    public async subscribe(): Promise<void> {
        this.showSubscribeForm(false);

        this.working(true);

        const userId = this.usersService.getCurrentUserId();

        if (!this.canSubscribe()) {
            return;
        }

        if (userId && this.usersService.isUserLoggedIn() && this.subscriptionName() !== "") {
            const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;
            await this.productService.createUserSubscription(subscriptionId, userId, this.product().id, this.subscriptionName());
            location.assign("/profile");
        }
        else {
            location.assign("/signin");
        }

        this.working(true);
    }

    public cancel(): void {
        this.routeHandler.navigateTo(this.currentUrl);
    }

    public canSubscribe(): boolean {
        return (!!this.subscriptionName() && this.subscriptionName().length > 0) && ((this.termsOfUse() && this.consented()) || !!!this.termsOfUse());
    }

    public toggle(): void {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        }
        else {
            this.showHideLabel("Hide");
        }
        this.showTerms(!this.showTerms());
    }

    // public setAgree() {
    //     this.consented(!this.consented());
    //     return this.consented();
    // }
}