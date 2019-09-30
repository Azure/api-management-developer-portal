import * as ko from "knockout";
import template from "./product-subscribe.html";
import { Router } from "@paperbits/common/routing";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Utils } from "../../../../../utils";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { SubscriptionState } from "../../../../../contracts/subscription";

@RuntimeComponent({ selector: "product-subscribe-runtime" })
@Component({
    selector: "product-subscribe-runtime",
    template: template,
    injectable: "productSubscribe"
})
export class ProductSubscribe {
    public readonly working: ko.Observable<boolean>;
    public readonly product: ko.Observable<Product>;
    public readonly showTermsOfUse: ko.Observable<boolean>;
    public readonly consented: ko.Observable<boolean>;
    public readonly termsOfUse: ko.Observable<string>;
    public readonly showHideLabel: ko.Observable<string>;
    public readonly subscriptionName: ko.Observable<string>;
    public readonly allowMultiple: ko.Observable<boolean>;
    public readonly limitReached: ko.Observable<boolean>;
    public readonly showLimitReached: ko.Computed<boolean>;
    public readonly canSubscribe: ko.Computed<boolean>;
    public readonly showSubscribeForm: ko.Observable<boolean>;
    public readonly showAddSubscription: ko.Computed<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.product = ko.observable();
        this.showTermsOfUse = ko.observable();
        this.consented = ko.observable();
        this.termsOfUse = ko.observable();
        this.showHideLabel = ko.observable();
        this.showSubscribeForm = ko.observable(false);
        this.subscriptionName = ko.observable();
        this.limitReached = ko.observable();
        this.allowMultiple = ko.observable();
        this.working = ko.observable(true);

        this.canSubscribe = ko.pureComputed((): boolean => {
            return !!this.subscriptionName()
                && this.subscriptionName().length > 0
                && ((this.termsOfUse() && this.consented()) || !!!this.termsOfUse());
        });

        this.showLimitReached = ko.computed((): boolean => {
            return this.allowMultiple() && this.limitReached();
        });

        this.showAddSubscription = ko.computed((): boolean => {
            return !this.allowMultiple() && !this.limitReached() && !this.showSubscribeForm();
        });
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.loadProduct);

        await this.loadProduct();
    }

    private getProductId(): string {
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash);
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : null;
    }

    private async loadProduct(): Promise<void> {
        try {
            this.showSubscribeForm(false);
            this.showTermsOfUse(false);
            this.working(true);

            const productId = this.getProductId();

            if (!productId) {
                return;
            }

            const product = await this.productService.getProduct(productId);

            if (!product) {
                return;
            }

            this.product(product);
            this.subscriptionName(product.name);
            this.termsOfUse(product.terms);

            if (product.terms) {
                this.showHideLabel("Show");
            }

            await this.loadSubscriptions();
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

    private async loadSubscriptions(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            return;
        }

        const product = this.product();
        const subscriptions = await this.productService.getUserSubscriptionsWithProductName(userId);
        const activeSubscriptions = subscriptions.filter(item => item.productId === product.id && item.state === SubscriptionState.active) || [];
        const numberOfSubscriptions = activeSubscriptions.length;
        const allowMultiple = product.subscriptionsLimit !== 1;
        const limitReached = product.subscriptionsLimit && product.subscriptionsLimit <= numberOfSubscriptions;

        this.allowMultiple(allowMultiple);
        this.limitReached(limitReached);
    }

    public addSubscription(): void {
        this.showSubscribeForm(true);
    }

    public async subscribe(): Promise<void> {
        if (!this.canSubscribe()) {
            return;
        }

        this.working(true);

        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            this.usersService.navigateToSignin();
        }

        if (!this.subscriptionName()) {
            return;
        }

        const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;

        try {
            await this.productService.createSubscription(subscriptionId, userId, this.product().id, this.subscriptionName());
            this.usersService.navigateToProfile();
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            // TODO: Uncomment when API is in place:
            // this.notify.error("Oops, something went wrong.", "We're unable to load products. Please try again later.");

            throw error;
        }
        finally {
            this.working(false);
        }
    }

    public toggleTermsOfUser(): void {
        // TODO: Move terms of use to a separate widget?
        if (this.showTermsOfUse()) {
            this.showHideLabel("Show");
        }
        else {
            this.showHideLabel("Hide");
        }
        this.showTermsOfUse(!this.showTermsOfUse());
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadProduct);
    }
}