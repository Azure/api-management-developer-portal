import { SmapiClient } from "./smapiClient";
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
        private readonly smapiClient: SmapiClient,
        private readonly tenantService: TenantService
    ) {}
    
    /**
     * Get page of subscriptions without product name for user
     * 
     * @param userId 
     */
    public async getSubscriptions(userId: string): Promise<Page<Subscription>> {
        const pageContract = await this.smapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions`);
        const result = new Page<Subscription>();

        if (pageContract && pageContract.value) {
            result.value = pageContract.value.map(item => new Subscription(item));
        }
        else {
            result.value = [];
        }
        return result;
    }

    /**
     * Get page of subscriptions with product name for user 
     * 
     * @param userId 
     */
    public async getUserSubscriptions(userId: string): Promise<Subscription[]> {
        const result = [];
        const contracts = await this.smapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions`);

        if (contracts && contracts.value) {
            const products = await this.getProducts();            
            contracts.value.map((item) => {
                const model = new Subscription(item);
                const product = products.find(p => p.id === model.productId);
                model.productName = product && product.name;
                result.push(model);
            });
        }
        
        return result;
    }

    public async getSubscription(subscriptionId: string, loadProduct: boolean = true): Promise<Subscription> {
        const contract = await this.smapiClient.get<SubscriptionContract>(subscriptionId);
        if (contract) {          
            const model = new Subscription(contract);
            if (loadProduct) {
                const product = await this.getProduct(model.productId);
                model.productName = product && product.name;
            }
            return model;
        }
        return undefined;
    }

    public async getProducts(): Promise<Product[]> {
        const result = [];
        const contracts = await this.smapiClient.get<Page<ProductContract>>(`/products`);
        if (contracts && contracts.value) {
            contracts.value.map(item => result.push(new Product(item)));
        }
        return result;
    }

    public async getProduct(productId: string): Promise<Product> {
        const contract = await this.smapiClient.get<ProductContract>(productId);
        if (contract) {
            return new Product(contract);
        }
        return undefined;
    }

    public async regeneratePrimaryKey(subscriptionId: string, userId: string): Promise<Subscription> {
        await this.smapiClient.post(`${userId + subscriptionId}/regeneratePrimaryKey`);
        return await this.getSubscription(userId + subscriptionId);
    }

    public async regenerateSecondaryKey(subscriptionId: string, userId: string): Promise<Subscription> {
        await this.smapiClient.post(`${userId + subscriptionId}/regenerateSecondaryKey`);
        return await this.getSubscription(userId + subscriptionId);
    }

    public async createUserSubscription(subscriptionId: string, userId: string, productId: string, subscriptionName: string): Promise<void> {
        await this.loadTenantSettings();

        if (this.tenantSettings["CustomPortalSettings.DelegationEnabled"] === true) {
            console.log("Delegation enabled. Can't create subscription");
        } else {
            const data = {
                scope: productId,
                name: subscriptionName
            };
            await this.smapiClient.put(userId + subscriptionId, null, data);
        }
    }

    public async cancelUserSubscription(subscriptionId: string, userId: string): Promise<Subscription> {
        await this.loadTenantSettings();

        if (this.tenantSettings["CustomPortalSettings.DelegationEnabled"] === true) {
            console.log("Delegation enabled. Can't cancel subscription");
        } else {
            await this.updateSubscription(userId + subscriptionId, { state: SubscriptionState.cancelled });
        }

        return await this.getSubscription(userId + subscriptionId);
    }

    public async renameUserSubscription(subscriptionId: string, userId: string, newName: string): Promise<Subscription> {
        await this.loadTenantSettings();

        if (newName) {
            await this.updateSubscription(userId + subscriptionId, { name: newName });
        }

        return await this.getSubscription(userId + subscriptionId);
    }

    private async updateSubscription(subscriptionId: string, body?: object) {
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