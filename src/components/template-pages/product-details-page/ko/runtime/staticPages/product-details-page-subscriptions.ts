import * as ko from "knockout"
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import template from "./product-details-page-subscriptions.html";
import { UsersService } from "../../../../../../services";
import { ProductService } from "../../../../../../services/productService";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { BackendService } from "../../../../../../services/backendService";
import { TenantService } from "../../../../../../services/tenantService";
import { Subscription } from "../../../../../../models/subscription";
import { Product } from "../../../../../../models/product";
import { SubscriptionListItem } from "../../../../../users/subscriptions/ko/runtime/subscriptionListItem";
import { Utils } from "../../../../../../utils";
import { DelegationParameters, DelegationAction } from "../../../../../../contracts/tenantSettings";
import { EventManager } from "@paperbits/common/events";
import { parseAndDispatchError } from "../../../../../users/validation-summary/utils";
import { ErrorSources } from "../../../../../users/validation-summary/constants";

@Component({
    selector: "product-details-page-subscriptions",
    template: template
})
export class ProdutDetailsPageSubscriptions {
    public readonly isUserSignedIn: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly subscriptions: ko.ObservableArray<SubscriptionListItem>;
    public readonly nextLink: ko.Observable<string>;
    public readonly loadModeSubscriptions: ko.Observable<boolean>;

    @Param()
    public readonly product: ko.Observable<Product>;

    @Param()
    public readonly openSubscribeForm: () => void;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly eventManager: EventManager
    ) {
        this.isUserSignedIn = ko.observable();
        this.working = ko.observable();
        this.subscriptions = ko.observableArray();
        this.nextLink = ko.observable();
        this.product = ko.observable();
        this.loadModeSubscriptions = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadProductSubscriptions();
    }

    public async renameSubscription(subscription: SubscriptionListItem): Promise<void> {
        try {
            const updated = await this.productService.renameSubscription(subscription.model.id, subscription.editName());
            const updatedVM = new SubscriptionListItem(updated, this.eventManager);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            this.subscriptions.replace(subscription, updatedVM);
            subscription.toggleEdit();
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.renameSubscription, error);
        }
    }

    public async loadMoreSubscriptions(): Promise<void> {
        this.loadModeSubscriptions(true);

        const userId = await this.usersService.getCurrentUserId();
        if (!userId) {
            return;
        }

        const pageOfSubscriptions = await this.productService.getMoreSubscriptionsForProduct(userId, this.nextLink());
        const subscriptions = pageOfSubscriptions.value.map(item => new SubscriptionListItem(item, this.eventManager));
        const newSubscriptions = this.subscriptions().concat(subscriptions);

        this.subscriptions(newSubscriptions);
        this.nextLink(pageOfSubscriptions.nextLink);

        this.loadModeSubscriptions(false);
    }

    public async cancelSubscription(subscription: SubscriptionListItem): Promise<void> {
        if (!subscription || !subscription.model || !subscription.model.id) {
            return;
        }
        const subscriptionId = subscription.model.id;

        subscription.isSRegenerating(true);

        try {
            await this.applyDelegation(subscriptionId);
            const updated = await this.productService.cancelSubscription(subscriptionId);
            const updatedVM = new SubscriptionListItem(updated, this.eventManager);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            this.subscriptions.replace(subscription, updatedVM);
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

        } finally {
            subscription.isSRegenerating(false);
        }
    }

    private async loadProductSubscriptions(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();
        //this.isUserSignedIn(false);
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
            const subscriptions = pageOfSubscriptions.value.map(item => new SubscriptionListItem(item, this.eventManager));
            this.subscriptions(subscriptions);
            this.nextLink(pageOfSubscriptions.nextLink);
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

    private syncSubscriptionLabelState(subscription: SubscriptionListItem, updatedVM: SubscriptionListItem): void {
        if (updatedVM.model.productName === undefined) {
            updatedVM.model.productName = subscription.model.productName;
        }

        if (subscription.primaryKeyBtnLabel() !== updatedVM.primaryKeyBtnLabel()) {
            updatedVM.togglePrimaryKey();
        }
        if (subscription.secondaryKeyBtnLabel() !== updatedVM.secondaryKeyBtnLabel()) {
            updatedVM.toggleSecondaryKey();
        }
    }

    private async applyDelegation(subscriptionId: string): Promise<void> {
        const isDelegationEnabled = await this.tenantService.isSubscriptionDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.SubscriptionId] = Utils.getResourceName("subscriptions", subscriptionId);
            const delegationUrl = await this.backendService.getDelegationString(DelegationAction.unsubscribe, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }
        }
    }
}