import * as ko from "knockout";
import { Component, OnMounted, Param, RuntimeComponent } from "@paperbits/common/ko/decorators";
import template from "./product-details-page.html";
import { Product } from "../../../../../models/product";
import { breadcrumbItem, menuItem, menuItemType } from "../../../common/Utils";
import { ProductService } from "../../../../../services/productService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { UsersService } from "../../../../../services/usersService";

@RuntimeComponent({
    selector: "product-details-page"
})
@Component({
    selector: "product-details-page",
    template: template
})
export class ProductDetailsPage {
    public readonly product: ko.Observable<Product>;
    public readonly breadcrumbItems: ko.Observable<breadcrumbItem[]>;
    public readonly productLoading: ko.Observable<boolean>;
    public readonly selectedMenuItem: ko.Observable<menuItem>;
    public readonly showSubscribeForm: ko.Observable<boolean>;
    public readonly canCreateNewSubscription: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    constructor(
        private readonly productService: ProductService,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router,
        private readonly usersService: UsersService
    ) {
        this.product = ko.observable();
        this.breadcrumbItems = ko.observable([]);
        this.productLoading = ko.observable(true);
        this.selectedMenuItem = ko.observable();
        this.wrapText = ko.observable();
        this.showSubscribeForm = ko.observable(false);
        this.canCreateNewSubscription = ko.observable(false);
        this.calculateCanCreateNewSubscription = this.calculateCanCreateNewSubscription.bind(this);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.router.addRouteChangeListener(this.onRouteChange);
        const productName = this.routeHelper.getProductName();

        this.loadProduct(productName);

        this.selectedMenuItem.subscribe((menuItem) => {
            let url = ""

            if (menuItem.type === menuItemType.staticMenuItemType) {
                url = this.routeHelper.getProductDetailsPageReference(this.product().name, menuItem.value);
            }

            if (menuItem.type === menuItemType.documentationMenuItemType) {
                url = this.routeHelper.getProductDocumentationReferenceUrl(this.product().name, menuItem.value);
            }

            const breadcrumbs = this.breadcrumbItems();
            breadcrumbs.pop();
            breadcrumbs.push({ title: menuItem.displayName, url: url });
            this.breadcrumbItems(breadcrumbs);
        });
    }

    public openSubscriptionForm() {
        this.showSubscribeForm(true);
    }

    public closeSubscriptionForm(reloadSubscriptions?: boolean) {
        this.showSubscribeForm(false);

        if (!!reloadSubscriptions) {
            this.loadProduct(this.product().name);
        }
    }

    public async calculateCanCreateNewSubscription(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            this.canCreateNewSubscription(false);
            return;
        }

        const subscriptions = await this.productService.getSubscriptionsForProduct(userId, this.product().id);
        const activeSubscriptions = subscriptions.value.filter(item => item.state === SubscriptionState.active || item.state === SubscriptionState.submitted) || [];
        const numberOfSubscriptions = activeSubscriptions.length;
        const limitReached = (this.product().subscriptionsLimit || this.product().subscriptionsLimit === 0) && this.product().subscriptionsLimit <= numberOfSubscriptions;

        this.canCreateNewSubscription(!limitReached);
    }

    private async loadProduct(productName: string): Promise<void> {
        this.productLoading(true);
        try {
            const product = await this.productService.getProduct(`products/${productName}`);
            this.product(product);

            this.initializeBreadcrumbItems();
            await this.calculateCanCreateNewSubscription();
        }
        catch (error) {
            console.error(`Unable to load product: ${error}`);
        }
        finally {
            this.productLoading(false);
        }
    }

    private async onRouteChange(): Promise<void> {
        const productName = this.routeHelper.getProductName();

        if (!productName || productName === this.product().name) {
            return;
        }

        await this.loadProduct(productName);
    }

    private initializeBreadcrumbItems() {
        const productReferenceUrl = this.routeHelper.getProductReferenceUrl(this.product().name);
        this.breadcrumbItems([{ title: "Home", url: "/" },
        { title: "Products", url: "/products" },
        { title: this.product().name, url: this.routeHelper.getProductDetailsPageReference(this.product().name, "about") },
        { title: "About this Product", url: productReferenceUrl }])
    }
}