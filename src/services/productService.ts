import { MapiClient } from "./mapiClient";
import { Page } from "../models/page";
import { Subscription } from "../models/subscription";
import { Product } from "../models/product";
import { SubscriptionContract, SubscriptionState } from "../contracts/subscription";
import { ProductContract } from "../contracts/product";
import { TenantService } from "../services/tenantService";
import { HttpHeader } from "@paperbits/common/http";
import * as Constants from "../constants";
import { Utils } from "../utils";
import { SearchQuery } from "../contracts/searchQuery";

/**
 * A service for management operations with products.
 */
export class ProductService {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly tenantService: TenantService
    ) { }

    /**
     * Returns user subscriptions.
     * @param userId {string} User unique identifier.
     * @param productId {string} Product unique identifier.
     */
    public async getSubscriptions(userId: string, productId?: string): Promise<Page<Subscription>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const pageOfSubscriptions = new Page<Subscription>();
        const query = productId ? `?$filter=properties/scope eq '${productId}'` : "";

        try {
            const pageContract = await this.mapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions${query}`);

            pageOfSubscriptions.value = pageContract && pageContract.value
                ? pageContract.value.map(item => new Subscription(item)) : [];

            pageOfSubscriptions.count = pageContract.count;
            pageOfSubscriptions.nextLink = pageContract.nextLink;
            return pageOfSubscriptions;
        }
        catch (error) {
            if (error && error.code === "ResourceNotFound") {
                return pageOfSubscriptions;
            }

            throw new Error(`Unable to retrieve subscriptions for user with ID "${userId}". Error: ${error.message}`);
        }
    }

    /**
     * Returns user subscriptions for specified product.
     * @param userId {string} User unique identifier.
     * @param productId {string} Product unique identifier.
     */
    public async getSubscriptionsForProduct(userId: string, productId: string): Promise<Page<Subscription>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        try {
            const pageOfSubscriptions = await this.getSubscriptions(userId, productId);
            return pageOfSubscriptions;
        }
        catch (error) {
            if (error && error.code === "ResourceNotFound") {
                return new Page();
            }

            throw new Error(`Unable to retrieve subscriptions for user with ID "${userId}". Error: ${error.message}`);
        }
    }

    /**
     * Returns user subscriptions with product name.
     * @param userId {string} User unique identifier.
     */
    public async getUserSubscriptionsWithProductName(userId: string): Promise<Subscription[]> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const result = [];
        const contracts = await this.mapiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions`);

        if (contracts && contracts.value) {
            const products = await this.getProducts(true);

            contracts.value
                .map((item) => {
                    const model = new Subscription(item);
                    const product = products.find(p => model.scope.endsWith(p.id));
                    model.productName = product && product.displayName;
                    result.push(model);
                });
        }

        return result;
    }

    /**
     * Returns a subsription by ID.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     * @param loadProduct {boolean} Indicates whether products should be included.
     */
    public async getSubscription(subscriptionId: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        const contract = await this.mapiClient.get<SubscriptionContract>(subscriptionId);

        if (!contract) {
            return null;
        }

        if (contract) {
            return new Subscription(contract);
        }
    }

    /**
     * Returns all products.
     * TODO: Review naming and usage.
     */
    public async getProducts(getAll: boolean = false): Promise<Product[]> {
        const result = [];
        const contracts = await this.mapiClient.get<Page<ProductContract>>(`/products`);

        if (contracts && contracts.value) {
            if (getAll) {
                contracts.value.map(item => result.push(new Product(item)));
            }
            else {
                contracts.value
                    .filter(x => x.properties.subscriptionRequired === true)
                    .map(item => result.push(new Product(item)));
            }
        }

        return result;
    }

    /**
     * Returns page of products filtered by name.
     */
    public async getProductsPage(filter: SearchQuery): Promise<Page<Product>> {
        const skip = filter.skip || 0;
        const take = filter.take || Constants.defaultPageSize;
        let query = `/products?$top=${take}&$skip=${skip}`;

        if (filter.pattern) {
            query = Utils.addQueryParameter(query, `$filter=(contains(properties/displayName,'${encodeURIComponent(filter.pattern)}'))`);
        }

        const page = await this.mapiClient.get<Page<ProductContract>>(query);
        const result = new Page<Product>();
        result.count = page.count;
        result.nextLink = page.nextLink;
        result.value = page.value.map(item => new Product(item));
        return result;
    }

    /**
     * Returns a product with specified ID.
     * @param productId {string} Product unique identifier.
     */
    public async getProduct(productId: string): Promise<Product> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        const contract = await this.mapiClient.get<ProductContract>(productId);

        if (contract) {
            return new Product(contract);
        }
        return undefined;
    }

    /**
     * Regenerates subscription primary key.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     */
    public async regeneratePrimaryKey(subscriptionId: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        await this.mapiClient.post(`${subscriptionId}/regeneratePrimaryKey`);
        return await this.getSubscription(subscriptionId);
    }

    /**
     * Regenerates subscription secondary key.
     * @param subscriptionId {string} Subscription unique identifier.
     */
    public async regenerateSecondaryKey(subscriptionId: string): Promise<Subscription> {
        await this.mapiClient.post(`${subscriptionId}/regenerateSecondaryKey`);
        return await this.getSubscription(subscriptionId);
    }

    /**
     * Creates subscription to specified product.
     * @param subscriptionId {string} Subscription unique identifier.
     * @param userId {string} User unique identifier.
     * @param productId {string} Product unique identifier.
     * @param subscriptionName  {string} Subscription name.
     */
    public async createSubscription(subscriptionId: string, userId: string, productId: string, subscriptionName: string): Promise<void> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const isDelegationEnabled = await this.tenantService.isSubscriptionDelegationEnabled();

        if (isDelegationEnabled) {
            console.warn("Delegation enabled. Can't create subscription.");
        }
        else {
            const data = {
                scope: productId,
                name: subscriptionName
            };
            await this.mapiClient.put(userId + subscriptionId, null, data);
        }
    }

    /**
     * Cancels subscription.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     */
    public async cancelSubscription(subscriptionId: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        const isDelegation = await this.tenantService.isSubscriptionDelegationEnabled();

        if (isDelegation) {
            console.warn("Delegation enabled. Can't cancel subscription");
        } else {
            await this.updateSubscription(subscriptionId, { state: SubscriptionState.cancelled });
        }

        return await this.getSubscription(subscriptionId);
    }

    /**
     * Updates subscription name.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     * @param newName {string} New subscription name.
     */
    public async renameSubscription(subscriptionId: string, newName: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        if (newName) {
            await this.updateSubscription(subscriptionId, { name: newName });
        }

        return await this.getSubscription(subscriptionId);
    }

    /**
     * Updates specified subscription.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     * @param body 
     */
    private async updateSubscription(subscriptionId: string, body?: object): Promise<void> {
        const header: HttpHeader = {
            name: "If-Match",
            value: "*"
        };

        await this.mapiClient.patch(subscriptionId, [header], body);
    }

    /**
     * Determines if specified subscription scope is suitable in context of an API or a Product.
     * @param scope {string} Subscription scope.
     * @param apiName {string} ARM name of the API.
     * @param productName {string} ARM name of the Product.
     */
    public isScopeSuitable(scope: string, apiName: string = null, productName: string = null): boolean {
        if (!scope) {
            throw new Error(`Parameter "scope" not specified.`);
        }

        return scope.endsWith("/apis")
            || (apiName && scope.endsWith(`/apis/${apiName}`))
            || (productName && scope.endsWith(`/products/${productName}`));
    }
}