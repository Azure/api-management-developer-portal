import * as ko from "knockout";
import * as moment from 'moment';
import template from "./user-subscriptions.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { Component } from "@paperbits/common/ko/decorators";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { User } from "../../../../models/user";
import { SubscriptionViewModel } from "./subscriptionViewModel";
import { UsersService } from "../../../../services/usersService";
import { ProductService } from "../../../../services/productService";
import { SubscriptionState } from "../../../../contracts/subscription";

@RuntimeComponent({ selector: "user-subscriptions" })
@Component({
    selector: "user-subscriptions",
    template: template,
    injectable: "userSubscriptions"
})
export class UserSubscriptions {
    private userId: string;
    public user: User;
    public subscriptions: ko.ObservableArray<SubscriptionViewModel>;

    constructor(
        private readonly usersService: UsersService,
        private readonly productService: ProductService, 
        private readonly routeHandler: IRouteHandler
    ) {
        this.subscriptions = ko.observableArray();
        this.regeneratePKey = this.regeneratePKey.bind(this);
        this.regenerateSKey = this.regenerateSKey.bind(this);
        this.renameSubscription = this.renameSubscription.bind(this);
        this.cancelSubscription = this.cancelSubscription.bind(this);

        this.selectProduct = this.selectProduct.bind(this);

        this.loadUser();
    }

    private async loadUser(): Promise<void> {
        if (!this.user) {
            this.userId = this.usersService.getCurrentUserId();
            const user:User = await this.usersService.getUser(this.userId);
            if (user) {
                this.user = user;

                await this.loadSubscriptions();
            } else {
                console.log("userId not found");
            }
        }        
    }

    private async loadSubscriptions() {
        if (this.user) {
            const models = await this.productService.getUserSubscriptions(this.userId);
            console.log(models);
            let subscriptions = [];
            models.map(item => item.state === SubscriptionState.active && subscriptions.push(new SubscriptionViewModel(item)));
            this.subscriptions(subscriptions);
        }
    }

    public timeToString(date: Date): string {
        return moment(date).format("MM/DD/YYYY");
    }

    public selectProduct(subscription: SubscriptionViewModel) {
        location.assign(subscription.model.productId);        
        // this.routeHandler.navigateTo(subscription.model.productId);
    }

    public async renameSubscription(subscription: SubscriptionViewModel) {
        const updated = await this.productService.renameUserSubscription(subscription.model.id, subscription.model.userId, subscription.editName())
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.toggleEdit();
    }

    public async regeneratePKey(subscription: SubscriptionViewModel) {
        subscription.isPRegenerating(true);
        const updated = await this.productService.regeneratePrimaryKey(subscription.model.id, subscription.model.userId);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isPRegenerating(false);
    }

    public async regenerateSKey(subscription: SubscriptionViewModel) {
        subscription.isSRegenerating(true);
        const updated = await this.productService.regenerateSecondaryKey(subscription.model.id, subscription.model.userId);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isSRegenerating(false);
    }

    private syncSubscriptionLabelState(subscription: SubscriptionViewModel, updatedVM: SubscriptionViewModel) {
        if(subscription.primaryKeyBtnLabel() !== updatedVM.primaryKeyBtnLabel()) {
            updatedVM.togglePrimaryKey();
        }
        if(subscription.secondaryKeyBtnLabel() !== updatedVM.secondaryKeyBtnLabel()) {
            updatedVM.toggleSecondaryKey();
        }
    }

    public async cancelSubscription(subscription: SubscriptionViewModel) {
        const updated = await this.productService.cancelUserSubscription(subscription.model.id, subscription.model.userId);
        const updatedVM = new SubscriptionViewModel(updated);
        this.syncSubscriptionLabelState(subscription, updatedVM);
        this.subscriptions.replace(subscription, updatedVM);
        subscription.isSRegenerating(false);
    }
}