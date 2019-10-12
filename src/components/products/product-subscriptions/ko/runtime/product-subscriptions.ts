import * as ko from "knockout";
import template from "./product-subscriptions.html";
import { Subscription } from "../../../../../models/subscription";
import { Router } from "@paperbits/common/routing";
import { Component, OnMounted, RuntimeComponent, OnDestroyed } from "@paperbits/common/ko/decorators";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";

@RuntimeComponent({ selector: "product-subscriptions-runtime" })
@Component({
    selector: "product-subscriptions-runtime",
    template: template,
    injectable: "productSubscriptions"
})
export class ProductSubscriptions {
    public readonly isUserSignedIn: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly subscriptions: ko.ObservableArray<Subscription>;

    public readonly page: ko.Observable<number>;
    public readonly hasPager: ko.Computed<boolean>;
    public readonly hasPrevPage: ko.Observable<boolean>;
    public readonly hasNextPage: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router
    ) {
        this.isUserSignedIn = ko.observable();
        this.working = ko.observable();
        this.subscriptions = ko.observableArray();

        this.page = ko.observable(1);
        this.hasPrevPage = ko.observable(false);
        this.hasNextPage = ko.observable(false);
        this.hasPager = ko.computed(() => this.hasPrevPage() || this.hasNextPage());
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.loadProductSubscriptions);
        await this.loadProductSubscriptions();
    }

    private getProductId(): string {
        const route = this.router.getCurrentRoute();        
        const queryParams = new URLSearchParams(route.hash || (route.url.indexOf("?") !== -1 ? route.url.split("?").pop() : ""));
        const productId = queryParams.get("productId");

        return productId ? `/products/${productId}` : null;
    }

    private async loadProductSubscriptions(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();        
        this.isUserSignedIn(!!userId);

        if (!userId) {
            return;
        }

        const productId = this.getProductId();
        if (!productId) {
            return;
        }

        this.working(true);
        try {
            const pageNumber = this.page() - 1;
            const itemsPage = await this.productService.getSubscriptionsForProduct(userId, productId);

            this.hasPrevPage(pageNumber > 0);
            this.hasNextPage(!!itemsPage.nextLink);
            this.subscriptions(itemsPage.value);
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


    public prevPage(): void {
        this.page(this.page() - 1);
        this.loadProductSubscriptions();
    }

    public nextPage(): void {
        this.page(this.page() + 1);
        this.loadProductSubscriptions();
    }
    
    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadProductSubscriptions);
    }
}