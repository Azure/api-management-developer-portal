import * as ko from "knockout";
import * as moment from "moment";
import template from "./subscriptions.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { SubscriptionListItem } from "./subscriptionListItem";
import { UsersService } from "../../../../../services";
import { ProductService } from "../../../../../services/productService";
import { TenantService } from "../../../../../services/tenantService";
import { DelegationParameters, DelegationAction } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";
import { EventManager } from "@paperbits/common/events";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { BackendService } from "../../../../../services/backendService";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Logger } from "@paperbits/common/logging";

@RuntimeComponent({
    selector: "subscriptions-runtime"
})
@Component({
    selector: "subscriptions-runtime",
    template: template
})
export class Subscriptions {
    public readonly subscriptions: ko.ObservableArray<SubscriptionListItem>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;
    public readonly working: ko.Observable<boolean>;
    private userId: string;

    constructor(
        private readonly usersService: UsersService,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly productService: ProductService,
        private readonly eventManager: EventManager,
        private readonly logger: Logger
    ) {
        this.subscriptions = ko.observableArray();
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();
        this.working = ko.observable();
    }

    @OnMounted()
    public initialize(): void {
        this.loadUser();

        this.pageNumber
            .subscribe(this.loadSubscriptions.bind(this));
    }

    private async loadUser(): Promise<void> {
        this.userId = await this.usersService.ensureSignedIn();
        if(!this.userId){
            return;
        }
        
        await this.loadSubscriptions();
    }

    private async loadSubscriptions(): Promise<void> {
        try {
            this.working(true);
            const pageNumber = this.pageNumber() - 1;

            const query: SearchQuery = {
                skip: pageNumber * Constants.defaultPageSize,
                take: Constants.defaultPageSize
            };

            const subscriptionsPage = await this.productService.getUserSubscriptionsWithProductName(this.userId, query);
            const subscriptions = subscriptionsPage.value.map(item => new SubscriptionListItem(item, this.eventManager));

            this.nextPage(!!subscriptionsPage.nextLink);

            this.subscriptions(subscriptions);
        } catch (error) {
            throw new Error(`Unable to load subscriptions. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
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
            parseAndDispatchError(this.eventManager, ErrorSources.renameSubscription, error, this.logger);
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
            parseAndDispatchError(this.eventManager, ErrorSources.regeneratePKey, error, this.logger);
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
            parseAndDispatchError(this.eventManager, ErrorSources.regenerateSKey, error, this.logger);
        }
        subscription.isSRegenerating(false);
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

            parseAndDispatchError(this.eventManager, ErrorSources.cancelSubscription, error, this.logger);
        } finally {
            subscription.isSRegenerating(false);
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
