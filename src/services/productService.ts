import { IApiClient } from "../clients";
import { Page } from "../models/page";
import { Subscription } from "../models/subscription";
import { Product } from "../models/product";
import { SubscriptionContract, SubscriptionState } from "../contracts/subscription";
import { ProductContract } from "../contracts/product";
import { HttpHeader } from "@paperbits/common/http";
import * as Constants from "../constants";
import { Utils } from "../utils";
import { SearchQuery } from "../contracts/searchQuery";
import { ApiContract } from "../contracts/api";
import { IDelegationService } from "./IDelegationService";
import { SubscriptionSecrets } from "../contracts/subscriptionSecrets";

/**
 * A service for management operations with products.
 */
export class ProductService {
    constructor(
        private readonly apiClient: IApiClient,
        private readonly delegationService: IDelegationService
    ) { }

    /**
     * Returns user subscriptions.
     * @param userId {string} User unique identifier.
     * @param productId {string} Product unique identifier.
     */
    public async getSubscriptions(userId: string, productId?: string, searchRequest?: SearchQuery): Promise<Page<Subscription>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const skip = searchRequest && searchRequest.skip || 0;
        const take = searchRequest && searchRequest.take || Constants.defaultPageSize;
        const odataFilterEntries = [];
        if (productId) {
            if (!productId.startsWith("/products/")) {
                productId = `/products/${productId}`;
            }

            // odataFilterEntries.push(`scope eq '${productId}'`)
            // Temporary fix for compatibility with workspaces
            odataFilterEntries.push(`(endswith(scope,'${productId}'))`);
        }

        if (searchRequest?.pattern) {
            const pattern = Utils.encodeURICustomized(searchRequest.pattern, Constants.reservedCharTuplesForOData);
            odataFilterEntries.push(`(contains(name,'${pattern}'))`);
        }

        const pageOfSubscriptions = new Page<Subscription>();
        let query = `?$top=${take}&$skip=${skip}`;

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }

        try {
            const pageContract = await this.apiClient.get<Page<SubscriptionContract>>(`${userId}/subscriptions${query}`, [await this.apiClient.getPortalHeader("getSubscriptions")]);
            const subscriptions = await this.getSubscriptionsData(pageContract.value);

            pageOfSubscriptions.value = subscriptions;
            pageOfSubscriptions.count = pageContract.count;
            pageOfSubscriptions.nextLink = pageContract.nextLink;

            return pageOfSubscriptions;
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                return pageOfSubscriptions;
            }

            throw new Error(`Unable to retrieve subscriptions for user with ID "${userId}". Error: ${error.message}`);
        }
    }

    /**
     * Returns all user products subscriptions for a query.
     * @param apiName {string} Api name to check scope in subscriptions.
     * @param products {Product[]} Products to check scope in subscriptions.
     * @param userId {string} User unique identifier.
     * @param searchRequest {SearchQuery} filter.
     */
    public async getProductsAllSubscriptions(apiName: string, products: Product[], userId: string, searchRequest?: SearchQuery): Promise<Subscription[]> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const odataFilterEntries = [];

        if (searchRequest?.pattern) {
            const pattern = Utils.encodeURICustomized(searchRequest.pattern, Constants.reservedCharTuplesForOData);
            odataFilterEntries.push(`(contains(name,'${pattern}'))`);
        }

        let query = "?$top=100&$skip=0";

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }

        try {
            const allContracts = await this.apiClient.getAll<SubscriptionContract>(`${userId}/subscriptions${query}`, [await this.apiClient.getPortalHeader("getSubscriptions")]);
            return await this.getSubscriptionsData(allContracts, products, apiName);
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                return [];
            }

            throw new Error(`Unable to retrieve subscriptions for user with ID "${userId}". Error: ${error.message}`);
        }
    }

    private async getSubscriptionsData(allContracts: SubscriptionContract[], products: Product[] = undefined, apiName: string = undefined): Promise<Subscription[]> {
        const subscriptions: Subscription[] = [];

        for (const subscriptionContract of allContracts) {
            // stop if we have enough subscriptions
            if( subscriptions.length >= Constants.defaultPageSize) {
                break;
            }

            // skip not active subscriptions
            if (SubscriptionState[subscriptionContract.state] !== SubscriptionState.active) {
                continue;
            }

            if ((products?.length > 0 || apiName) && !this.isScopeValid(subscriptionContract.scope, apiName, products)) {
                continue;
            }

            const subscription = new Subscription(subscriptionContract);

            subscriptions.push(subscription);
        }

        return subscriptions;
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
    public async getUserSubscriptionsWithProductName(userId: string, searchRequest?: SearchQuery): Promise<Page<Subscription>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }
        
        if (userId === Constants.integrationUserId) {
            return new Page();
        }

        const skip = searchRequest && searchRequest.skip || 0;
        const take = searchRequest && searchRequest.take || Constants.defaultPageSize;
        const query = `${userId}/subscriptions?$top=${take}&$skip=${skip}`;

        const result = [];
        const pageOfSubscriptions = await this.apiClient.get<Page<SubscriptionContract>>(query, [await this.apiClient.getPortalHeader("getUserSubscriptions")]);

        const page = new Page<Subscription>();
        page.count = pageOfSubscriptions.count;
        page.nextLink = pageOfSubscriptions.nextLink;
        page.value = result;

        if (!pageOfSubscriptions?.value) {
            return page;
        }

        const subscriptions = pageOfSubscriptions.value;
        const promises = [];

        for (const subscription of subscriptions) {
            const subscriptionModel = new Subscription(subscription);

            if (subscription.scope.endsWith("/apis")) {
                subscriptionModel.productName = "All APIs";
            } else
                if (subscription.scope.includes("/apis/")) {
                    const apiName = Utils.getResourceName("apis", subscription.scope);

                    const apiPromise = this.apiClient
                        .get<ApiContract>(`/apis/${apiName}`, [Utils.getIsUserResourceHeader(), await this.apiClient.getPortalHeader("getApi")])
                        .then(api => {
                            subscriptionModel.productName = `API: ${api.name}`;
                        }).catch(error => console.log(`Get API error: ${error.message}`));

                    promises.push(apiPromise);
                } else {
                    const productName = Utils.getResourceName("products", subscription.scope);

                    const productPromise = this.apiClient
                        .get<ProductContract>(`/products/${productName}`, [Utils.getIsUserResourceHeader(), await this.apiClient.getPortalHeader("getProduct")])
                        .then(product => {
                            subscriptionModel.productName = product.name;
                        }).catch(error => console.log(`Get product error: ${error.message}`));

                    promises.push(productPromise);
                }
            result.push(subscriptionModel);
        }

        await Promise.all(promises);

        return page;
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

        const contract = await this.apiClient.get<SubscriptionContract>(`/subscriptions/${subscriptionId}`, [await this.apiClient.getPortalHeader("getSubscription"), Utils.getIsUserResourceHeader()]);

        if (!contract) {
            return null;
        }

        const subscripitonModel = new Subscription(contract);

        return subscripitonModel;
    }

    /**
     * Returns all products.
     * TODO: Review naming and usage.
     */
    public async getProducts(getAll: boolean = false): Promise<Product[]> {
        const result = [];
        const contracts = await this.apiClient.get<Page<ProductContract>>(`/products`, [await this.apiClient.getPortalHeader("getProducts"), Utils.getIsUserResourceHeader()]);

        if (contracts && contracts.value) {
            if (getAll) {
                contracts.value.map(item => result.push(new Product(item)));
            }
            else {
                contracts.value
                    .filter(x => x.subscriptionRequired === true)
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
            query = Utils.addQueryParameter(query, `$filter=(contains(name,'${encodeURIComponent(filter.pattern)}'))`);
        }

        query = Utils.addQueryParameter(query, "skipWorkspaces=true");

        const page = await this.apiClient.get<Page<ProductContract>>(query, [Utils.getIsUserResourceHeader(), await this.apiClient.getPortalHeader("getProducts")]);
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

        const contract = await this.apiClient.get<ProductContract>(`/products/${productId}`, [await this.apiClient.getPortalHeader("getProduct"), Utils.getIsUserResourceHeader()]);

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

        await this.apiClient.post(`/subscriptions/${subscriptionId}/regeneratePrimaryKey`, [await this.apiClient.getPortalHeader("regeneratePrimaryKey"), Utils.getIsUserResourceHeader()]);

        return await this.getSubscription(subscriptionId);
    }

    /**
     * Regenerates subscription secondary key.
     * @param subscriptionId {string} Subscription unique identifier.
     */
    public async regenerateSecondaryKey(subscriptionId: string): Promise<Subscription> {
        await this.apiClient.post(`/subscriptions/${subscriptionId}/regenerateSecondaryKey`, [await this.apiClient.getPortalHeader("regenerateSecondaryKey"), Utils.getIsUserResourceHeader()]);
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

        const isDelegationEnabled = await this.delegationService.isSubscriptionDelegationEnabled();

        if (isDelegationEnabled) {
            console.warn("Delegation enabled. Can't create subscription.");
        }
        else {
            const payload = {
                scope: productId,
                name: subscriptionName
            };
            await this.apiClient.post(userId + subscriptionId, [await this.apiClient.getPortalHeader("createSubscription"), Utils.getIsUserResourceHeader()], payload);
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

        const isDelegationEnabled = await this.delegationService.isSubscriptionDelegationEnabled();

        if (isDelegationEnabled) {
            console.warn("Delegation enabled. Can't cancel subscription");
        }
        else {
            const headers: HttpHeader[] = [{ name: "If-Match", value: "*" }, await this.apiClient.getPortalHeader("cancelSubscription"), Utils.getIsUserResourceHeader()];

            const payload = {
                state: SubscriptionState.cancelled
            };

            await this.apiClient.patch(`/subscriptions/${subscriptionId}`, headers, payload);
        }

        return await this.getSubscription(subscriptionId);
    }

    /**
     * Updates subscription name.
     * @param subscriptionId subscriptionId {string} Subscription unique identifier.
     * @param subscriptionName {string} New subscription name.
     */
    public async renameSubscription(subscriptionId: string, subscriptionName: string): Promise<Subscription> {
        if (!subscriptionId) {
            throw new Error(`Parameter "subscriptionId" not specified.`);
        }

        if (!subscriptionName) {
            throw new Error(`Parameter "subscriptionName" not specified.`);
        }

        const headers: HttpHeader[] = [{ name: "If-Match", value: "*" }, await this.apiClient.getPortalHeader("renameSubscription"), Utils.getIsUserResourceHeader()];

        const payload = {
            name: subscriptionName
        };

        await this.apiClient.patch(`/subscriptions/${subscriptionId}`, headers, payload);

        return await this.getSubscription(subscriptionId);
    }

    /**
     * Determines if specified subscription scope is suitable in context of a Product.
     * @param scope {string} Subscription scope.
     * @param productName {string} ARM name of the Product.
     */
    public isProductScope(scope: string, productName: string): boolean {
        if (!scope) {
            throw new Error(`Parameter "scope" not specified.`);
        }

        return scope.endsWith("/apis")
            || (productName && scope.endsWith(`/products/${productName}`));
    }

    /**
     * Determines if specified subscription scope is suitable in context of an API.
     * @param scope {string} Subscription scope.
     * @param apiName {string} ARM name of the API.
     */
    public isApiScope(scope: string, apiName: string): boolean {
        if (!scope) {
            throw new Error(`Parameter "scope" not specified.`);
        }

        return apiName && scope.endsWith(`/apis/${apiName}`);
    }

    private isScopeValid(scope: string, apiName: string = undefined, products: Product[] = undefined): boolean {
        if (!scope) {
            throw new Error(`Parameter "scope" not specified.`);
        }

        return scope.endsWith("/apis")
            || (apiName && scope.endsWith(`/apis/${apiName}`))
            || (products && products.some(product => scope.endsWith(`/products/${product.name}`)));
    }
}