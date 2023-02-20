import * as ko from "knockout";
import * as moment from "moment";
import template from "./subscriptions.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { SubscriptionListItem } from "./subscriptionListItem";
import { UsersService } from "../../../../../services";
import { ProductService } from "../../../../../services/productService";
import { DelegationParameters, DelegationAction } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";
import { EventManager } from "@paperbits/common/events";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import IDelegationService from "../../../../../services/IDelegationService";

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
        private readonly delegationService: IDelegationService,
        private readonly productService: ProductService,
        private readonly eventManager: EventManager
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
        const subscriptions = models.map(item => new SubscriptionListItem(item, this.eventManager));

        this.subscriptions(subscriptions);
    }

    public timeToString(date: Date): string {
        return moment(date).format("MM/DD/YYYY");
    }

    public async renameSubscription(subscription: SubscriptionListItem): Promise<void> {
        dispatchErrors(this.eventManager, ErrorSources.renameSubscription, []);
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

    public async regeneratePKey(subscription: SubscriptionListItem): Promise<void> {
        subscription.isPRegenerating(true);
        dispatchErrors(this.eventManager, ErrorSources.regeneratePKey, []);
        try {
            const updated = await this.productService.regeneratePrimaryKey(subscription.model.id);
            const updatedVM = new SubscriptionListItem(updated, this.eventManager);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            updatedVM.changedItem("primaryKey");
            this.subscriptions.replace(subscription, updatedVM);
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.regeneratePKey, error);
        }
        subscription.isPRegenerating(false);
    }

    public async regenerateSKey(subscription: SubscriptionListItem): Promise<void> {
        subscription.isSRegenerating(true);
        dispatchErrors(this.eventManager, ErrorSources.regenerateSKey, []);
        try {
            const updated = await this.productService.regenerateSecondaryKey(subscription.model.id);
            const updatedVM = new SubscriptionListItem(updated, this.eventManager);
            this.syncSubscriptionLabelState(subscription, updatedVM);
            updatedVM.changedItem("secondaryKey");
            this.subscriptions.replace(subscription, updatedVM);
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.regenerateSKey, error);
        }
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

            parseAndDispatchError(this.eventManager, ErrorSources.cancelSubscription, error);
        } finally {
            subscription.isSRegenerating(false);
        }
    }

    private async applyDelegation(subscriptionId: string): Promise<void> {
        const isDelegationEnabled = await this.delegationService.isSubscriptionDelegationEnabled();
        if (isDelegationEnabled) {
            const userResource = await this.usersService.getCurrentUserId();
            const userId = Utils.getResourceName("users", userResource);
            const delegationParam = {};
            delegationParam[DelegationParameters.UserId] = userId
            delegationParam[DelegationParameters.SubscriptionId] = Utils.getResourceName("subscriptions", subscriptionId);
            const delegationUrl = await this.delegationService.getUserDelegationUrl(userId, DelegationAction.unsubscribe, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }
        }
    }
}
