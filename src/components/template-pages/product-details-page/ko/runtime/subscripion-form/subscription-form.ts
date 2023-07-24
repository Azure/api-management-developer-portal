import * as ko from "knockout";
import template from "./subscription-form.html";
import { Component, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Product } from "../../../../../../models/product";
import { UsersService } from "../../../../../../services";
import { Utils } from "../../../../../../utils";
import { ProductService } from "../../../../../../services/productService";
import { TenantService } from "../../../../../../services/tenantService";
import { DelegationAction, DelegationParameters } from "../../../../../../contracts/tenantSettings";
import { BackendService } from "../../../../../../services/backendService";
import { RouteHelper } from "../../../../../../routing/routeHelper";

@Component({
    selector: "subscription-form",
    template: template
})
export class SubscriptionForm {
    public readonly subscriptionName: ko.Observable<string>;
    public readonly consented: ko.Observable<boolean>;
    public readonly canSubscribe: ko.Computed<boolean>;
    public readonly working: ko.Observable<boolean>;
    public readonly hasError: ko.Observable<boolean>;
    public readonly isDelegationEnabled: ko.Observable<boolean>;
    product: ko.Observable<Product>;

    @Param()
    closeSubscriptionForm: () => void;

    constructor(private readonly usersService: UsersService,
        private readonly productService: ProductService,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly routeHelper: RouteHelper
    ) {
        this.subscriptionName = ko.observable("");
        this.consented = ko.observable(false);
        this.working = ko.observable(false);
        this.hasError = ko.observable(false);
        this.isDelegationEnabled = ko.observable(false);

        this.product = ko.observable();

        this.canSubscribe = ko.pureComputed((): boolean => {
            return (this.isDelegationEnabled() || this.subscriptionName().length > 0) && ((this.product().terms && this.consented()) || !this.product().terms);
        });
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const userId = await this.usersService.getCurrentUserId();

        if (!userId) {
            return;
        }

        const productName = this.routeHelper.getProductName();

        if (!productName) {
            return;
        }

        this.product(await this.productService.getProduct(`products/${productName}`));
        this.isDelegationEnabled(await this.tenantService.isSubscriptionDelegationEnabled());
    }

    public async subscribe(): Promise<void> {
        if (!this.canSubscribe()) {
            return;
        }

        const userId = await this.usersService.ensureSignedIn();

        if (!userId) {
            return;
        }

        this.working(true);
        this.hasError(false);

        try {
            if (this.isDelegationEnabled()) {
                const delegationParam = {};
                delegationParam[DelegationParameters.ProductId] = this.product().name;
                delegationParam[DelegationParameters.UserId] = Utils.getResourceName("users", userId);
                const delegationUrl = await this.backendService.getDelegationString(DelegationAction.subscribe, delegationParam);
                if (delegationUrl) {
                    location.assign(delegationUrl);
                    return;
                }
            }

            const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;
            await this.productService.createSubscription(subscriptionId, userId, `/products/${this.product().name}`, this.subscriptionName());


            this.closeSubscriptionForm();
        }
        catch (error) {
            this.hasError(true);
        }
        finally {
            this.working(false);
        }

    }
}