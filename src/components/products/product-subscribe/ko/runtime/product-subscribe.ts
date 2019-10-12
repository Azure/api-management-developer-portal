import * as ko from "knockout";
import template from "./product-subscribe.html";
import { Router } from "@paperbits/common/routing";
import { Component, OnMounted, RuntimeComponent, OnDestroyed } from "@paperbits/common/ko/decorators";
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
    public readonly limitReached: ko.Observable<boolean>;
    public readonly canSubscribe: ko.Computed<boolean>;
    public readonly isUserSignedIn: ko.Observable<boolean>;

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
        this.subscriptionName = ko.observable("");
        this.limitReached = ko.observable(false);
        this.working = ko.observable(true);
        this.isUserSignedIn = ko.observable(false);

        this.canSubscribe = ko.pureComputed((): boolean => {
            return this.subscriptionName().length > 0 && ((this.termsOfUse() && this.consented()) || !!!this.termsOfUse());
        });
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.loadProduct);

        await this.loadProduct();
    }

    private getProductId(): string {
        const route = this.router.getCurrentRoute();
        const queryParams = new URLSearchParams(route.hash || (route.url.indexOf("?") !== -1 ? route.url.split("?").pop() : ""));
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : null;
    }

    private async loadProduct(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();
        this.isUserSignedIn(!!userId);
        
        try {
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

            if (userId) {
                await this.loadSubscriptions(userId);
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

    private async loadSubscriptions(userId: string): Promise<void> {
        const product = this.product();
        const subscriptions = await this.productService.getSubscriptionsForProduct(userId, product.id);
        const activeSubscriptions = subscriptions.value.filter(item => item.state === SubscriptionState.active) || [];
        const numberOfSubscriptions = activeSubscriptions.length;
        const limitReached = (product.subscriptionsLimit || product.subscriptionsLimit === 0) && product.subscriptionsLimit <= numberOfSubscriptions;
        this.limitReached(limitReached);
    }

    public async subscribe(): Promise<void> {
        const userId = await this.usersService.ensureSignedIn();

        if (!this.canSubscribe()) {
            return;
        }

        this.working(true);

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

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadProduct);
    }
}