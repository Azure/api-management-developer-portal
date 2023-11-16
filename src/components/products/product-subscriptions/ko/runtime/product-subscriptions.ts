import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./product-subscriptions.html";
import { Subscription } from "../../../../../models/subscription";
import { Router } from "@paperbits/common/routing";
import { Component, OnMounted, RuntimeComponent, OnDestroyed } from "@paperbits/common/ko/decorators";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { RouteHelper } from "../../../../../routing/routeHelper";

@RuntimeComponent({
    selector: "product-subscriptions-runtime"
})
@Component({
    selector: "product-subscriptions-runtime",
    template: template
})
export class ProductSubscriptions {
    public readonly isUserSignedIn: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly subscriptions: ko.ObservableArray<Subscription>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<string>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.isUserSignedIn = ko.observable();
        this.working = ko.observable();
        this.subscriptions = ko.observableArray();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.loadProductSubscriptions);
        await this.loadProductSubscriptions();

        this.pageNumber
            .subscribe(this.loadProductSubscriptions);
    }

    private async loadProductSubscriptions(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();
        this.isUserSignedIn(!!userId);

        if (!userId) {
            return;
        }

        const productName = this.routeHelper.getProductName();

        if (!productName) {
            return;
        }

        this.working(true);

        try {
            const pageOfSubscriptions = await this.productService.getSubscriptionsForProduct(userId, `/products/${productName}`);

            this.subscriptions(pageOfSubscriptions.value);
            this.nextPage(pageOfSubscriptions.nextLink);
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            if (error.code === "ResourceNotFound") {
                return;
            }

            throw new Error(`Could not load product subscriptions. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadProductSubscriptions);
    }
}