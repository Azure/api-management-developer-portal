import * as ko from "knockout";
import * as moment from "moment";
import template from "./user-subscriptions.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { SubscriptionViewModel } from "./subscriptionViewModel";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { TenantService } from "../../../../../services/tenantService";
import { BackendService } from "../../../../../services/backendService";
import { DelegationParameters, DelegationAction } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";

@RuntimeComponent({ selector: "user-subscriptions" })
@Component({
    selector: "user-subscriptions",
    template: template,
    injectable: "userSubscriptions"
})
export class UserSubscriptions {
    public readonly subscriptions: ko.ObservableArray<SubscriptionViewModel>;

    constructor(
        private readonly usersService: UsersService, 
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
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
        const subscriptions = [];

        models.map(item => item.state === SubscriptionState.active && subscriptions.push(new SubscriptionViewModel(item)));

        this.subscriptions(subscriptions);
    }

    public timeToString(date: Date): string {
        return moment(date).format("MM/DD/YYYY");
    }

    public async renameSubscription(subscription: SubscriptionViewModel): Promise<void> {
        const updated = await this.productService.renameSubscription(subscription.model.id, subscription.editName());
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.toggleEdit();
    }

    public async regeneratePKey(subscription: SubscriptionViewModel): Promise<void> {
        subscription.isPRegenerating(true);
        const updated = await this.productService.regeneratePrimaryKey(subscription.model.id);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        updatedVM.changedItem("primaryKey");
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isPRegenerating(false);
    }

    public async regenerateSKey(subscription: SubscriptionViewModel): Promise<void> {
        subscription.isSRegenerating(true);
        const updated = await this.productService.regenerateSecondaryKey(subscription.model.id);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        updatedVM.changedItem("secondaryKey");
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isSRegenerating(false);
    }

    private syncSubscriptionLabelState(subscription: SubscriptionViewModel, updatedVM: SubscriptionViewModel): void {
        if (subscription.primaryKeyBtnLabel() !== updatedVM.primaryKeyBtnLabel()) {
            updatedVM.togglePrimaryKey();
        }
        if (subscription.secondaryKeyBtnLabel() !== updatedVM.secondaryKeyBtnLabel()) {
            updatedVM.toggleSecondaryKey();
        }
    }

    public async cancelSubscription(subscription: SubscriptionViewModel): Promise<void> {
        if (!subscription || !subscription.model || !subscription.model.id) {
            return;
        }
        const subscriptionId = subscription.model.id;

        subscription.isSRegenerating(true);

        try {
            const isDelegation = await this.isDelegation(subscriptionId);
            if (isDelegation) {
                return;
            }
            const updated = await this.productService.cancelSubscription(subscriptionId);
            const updatedVM = new SubscriptionViewModel(updated);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            this.subscriptions.replace(subscription, updatedVM);
        } catch (error) {
            if (error.code === "Unauthorized") {
                this.usersService.navigateToSignin();
                return;
            }

            throw error;
        } finally {
            subscription.isSRegenerating(false);
        }
    }
    
    private async isDelegation(subscriptionId: string): Promise<boolean> {
        const isDelegationEnabled = await this.tenantService.isSubscriptionDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.SubscriptionId] = Utils.getResourceName("subscriptions", subscriptionId);

            const delegationUrl = await this.backendService.getDelegationUrl(DelegationAction.unsubscribe, delegationParam);
            if (delegationUrl) {
                window.open(delegationUrl, "_self");
            }
            return true;
        }

        return false;
    }
}