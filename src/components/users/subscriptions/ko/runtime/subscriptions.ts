import * as ko from "knockout";
import * as moment from "moment";
import template from "./subscriptions.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { SubscriptionListItem } from "./subscriptionListItem";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { TenantService } from "../../../../../services/tenantService";
import { DelegationParameters, DelegationAction } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";
import { Router } from "@paperbits/common/routing/router";

@RuntimeComponent({
    selector: "subscriptions-runtime"
})
@Component({
    selector: "subscriptions-runtime",
    template: template
})
export class Subscriptions {
    public readonly subscriptions: ko.ObservableArray<SubscriptionListItem>;

    constructor(
        private readonly usersService: UsersService,
        private readonly tenantService: TenantService,
        private readonly router: Router,
        private readonly productService: ProductService
    ) {
        this.subscriptions = ko.observableArray();
    }

    @OnMounted()
    public initialize(): void {
        this.loadUser();
    }

    private async loadUser(): Promise<void> {
        const userId = await this.usersService.ensureSignedIn();

        await this.loadSubscriptions(userId);
    }

    private async loadSubscriptions(userId: string): Promise<void> {
        const models = await this.productService.getUserSubscriptionsWithProductName(userId);
        const subscriptions = models.map(item => new SubscriptionListItem(item));

        this.subscriptions(subscriptions);
    }

    public timeToString(date: Date): string {
        return moment(date).format("MM/DD/YYYY");
    }

    public async renameSubscription(subscription: SubscriptionListItem): Promise<void> {
        const updated = await this.productService.renameSubscription(subscription.model.id, subscription.editName());
        const updatedVM = new SubscriptionListItem(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.toggleEdit();
    }

    public async regeneratePKey(subscription: SubscriptionListItem): Promise<void> {
        subscription.isPRegenerating(true);
        const updated = await this.productService.regeneratePrimaryKey(subscription.model.id);
        const updatedVM = new SubscriptionListItem(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        updatedVM.changedItem("primaryKey");
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isPRegenerating(false);
    }

    public async regenerateSKey(subscription: SubscriptionListItem): Promise<void> {
        subscription.isSRegenerating(true);
        const updated = await this.productService.regenerateSecondaryKey(subscription.model.id);
        const updatedVM = new SubscriptionListItem(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        updatedVM.changedItem("secondaryKey");
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isSRegenerating(false);
    }

    private syncSubscriptionLabelState(subscription: SubscriptionListItem, updatedVM: SubscriptionListItem): void {
        if (subscription.primaryKeyBtnLabel() !== updatedVM.primaryKeyBtnLabel()) {
            updatedVM.togglePrimaryKey();
        }
        if (subscription.secondaryKeyBtnLabel() !== updatedVM.secondaryKeyBtnLabel()) {
            updatedVM.toggleSecondaryKey();
        }
    }

    public async cancelSubscription(subscription: SubscriptionListItem): Promise<void> {
        if (!subscription || !subscription.model || !subscription.model.id) {
            return;
        }
        const subscriptionId = subscription.model.id;

        subscription.isSRegenerating(true);

        try {
            const isDelegationEnabled = await this.isDelegationEnabled(subscriptionId);
            if (isDelegationEnabled) {
                return;
            }
            const updated = await this.productService.cancelSubscription(subscriptionId);
            const updatedVM = new SubscriptionListItem(updated);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            this.subscriptions.replace(subscription, updatedVM);
        }
        catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            throw error;
        } finally {
            subscription.isSRegenerating(false);
        }
    }

    private async isDelegationEnabled(subscriptionId: string): Promise<boolean> {
        const isDelegationEnabled = await this.tenantService.isSubscriptionDelegationEnabled();
        if (isDelegationEnabled) {
            const delegation = new URLSearchParams();
            delegation.append(DelegationParameters.SubscriptionId, Utils.getResourceName("subscriptions", subscriptionId));
            this.router.navigateTo(`/${DelegationAction.unsubscribe}?${delegation.toString()}`);

            return true;
        }

        return false;
    }
}