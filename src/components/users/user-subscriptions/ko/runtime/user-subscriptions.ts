import * as ko from "knockout";
import * as moment from "moment";
import template from "./user-subscriptions.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { User } from "../../../../../models/user";
import { SubscriptionViewModel } from "./subscriptionViewModel";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { SubscriptionState } from "../../../../../contracts/subscription";

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
        private readonly productService: ProductService
    ) {
        this.subscriptions = ko.observableArray();
    }

    @OnMounted()
    public initialize(): void {
        this.loadUser();
    }

    private async loadUser(): Promise<void> {
        await this.usersService.ensureSignedIn();

        const userId = await this.usersService.getCurrentUserId();

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
        const updated = await this.productService.cancelSubscription(subscription.model.id);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isSRegenerating(false);
    }
}