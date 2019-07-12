import { MapiClient } from "./mapiClient";
import { Page } from "../models/page";
import { Subscription } from "../models/subscription";
import { Product } from "../models/product";
import { SubscriptionContract, SubscriptionState } from "../contracts/subscription";
import { ProductContract } from "../contracts/product";
import { TenantSettings } from "../contracts/tenantSettings";
import { TenantService } from "../services/tenantService";
import { HttpHeader } from "@paperbits/common/http";

export class ProductService {
    private tenantSettings: TenantSettings;

    constructor(
        private readonly smapiClient: MapiClient,
        private readonly tenantService: TenantService
    ) { }

    /**
     * Get page of subscriptions without product name for user
     * 
     * @param userId 
     */
    public async getSubscriptions(userId: string): Promise<Page<Subscription>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const pageContract = await this.smapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions`);
        const result = new Page<Subscription>();

        result.value = pageContract && pageContract.value
            ? pageContract.value.filter(item => item.properties.scope.indexOf("/products/") !== -1).map(item => new Subscription(item))
            : [];

        return result;
    }

    public async getSubscriptionsForProduct(userId: string, productId: string): Promise<Subscription[]> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        const pageOfSubscriptions = await this.getSubscriptions(userId);
        const subscriptions = pageOfSubscriptions.value.filter(subscription => subscription.state === "active");
        const result = subscriptions.filter(subscription => subscription.productId === productId);

        return result;
    }

    /**
     * Get page of subscriptions with product name for user 
     * 
     * @param userId 
     */
    public async getUserSubscriptions(userId: string): Promise<Subscription[]> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const result = [];
        const contracts = await this.smapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions`);

        if (contracts && contracts.value) {
            const products = await this.getProducts(true);

            contracts.value.filter(item => item.properties.scope.indexOf("/products/") !== -1).map((item) => {
                const model = new Subscription(item);
                const product = products.find(p => p.id === model.productId);
                model.productName = product && product.name;
                result.push(model);
            });
        }

        return result;
    }

    public async getSubscription(subscriptionId: string, loadProduct: boolean = true): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        const contract = await this.smapiClient.get<SubscriptionContract>(subscriptionId);

        if (!contract) {
            return null;
        }

        if (contract) {
            const model = new Subscription(contract);

            if (loadProduct) {
                const product = await this.getProduct(model.productId);
                model.productName = product && product.name;
            }

            return model;
        }
    }

    public async getProducts(getAll: boolean = false): Promise<Product[]> {
        const result = [];
        const contracts = await this.smapiClient.get<Page<ProductContract>>(`/products`);

        if (contracts && contracts.value) {
            if (getAll) {
                contracts.value.map(item => result.push(new Product(item)));
            } else {
                contracts.value
                    .filter(x => x.properties.subscriptionRequired === true)
                    .map(item => result.push(new Product(item)));
            }
        }

        return result;
    }

    public async getProduct(productId: string): Promise<Product> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        const contract = await this.smapiClient.get<ProductContract>(productId);

        if (contract) {
            return new Product(contract);
        }
        return undefined;
    }

    public async regeneratePrimaryKey(subscriptionId: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        await this.smapiClient.post(`${subscriptionId}/regeneratePrimaryKey`);
        return await this.getSubscription(subscriptionId);
    }

    public async regenerateSecondaryKey(subscriptionId: string): Promise<Subscription> {
        await this.smapiClient.post(`${subscriptionId}/regenerateSecondaryKey`);
        return await this.getSubscription(subscriptionId);
    }

    public async createUserSubscription(subscriptionId: string, userId: string, productId: string, subscriptionName: string): Promise<void> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        await this.loadTenantSettings();

        if (this.tenantSettings["CustomPortalSettings.DelegationEnabled"] === true) {
            console.log("Delegation enabled. Can't create subscription");
        }
        else {
            const data = {
                scope: productId,
                name: subscriptionName
            };
            await this.smapiClient.put(userId + subscriptionId, null, data);
        }
    }

    public async cancelUserSubscription(subscriptionId: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        await this.loadTenantSettings();

        if (this.tenantSettings["CustomPortalSettings.DelegationEnabled"] === true) {
            console.log("Delegation enabled. Can't cancel subscription");
        } else {
            await this.updateSubscription(subscriptionId, { state: SubscriptionState.cancelled });
        }

        return await this.getSubscription(subscriptionId);
    }

    public async renameUserSubscription(subscriptionId: string, newName: string): Promise<Subscription> {
        await this.loadTenantSettings();

        if (newName) {
            await this.updateSubscription(subscriptionId, { name: newName });
        }

        return await this.getSubscription(subscriptionId);
    }

    private async updateSubscription(subscriptionId: string, body?: object): Promise<void> {
        const header: HttpHeader = {
            name: "If-Match",
            value: "*"
        };

        await this.smapiClient.patch(subscriptionId, [header], body);
    }

    private async loadTenantSettings(): Promise<void> {
        if (!this.tenantSettings) {
            this.tenantSettings = await this.tenantService.getSettings();
        }
    }
}