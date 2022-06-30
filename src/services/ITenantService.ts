/**
 * A service for management operations with API Management/Data API tenant.
 */
export default interface ITenantService {
    /**
     * Returns API Management service SKU name.
     */
    getServiceSkuName(): Promise<string>;

    /**
     * Specifies whether signin is delegated to external system.
     */
    isDelegationEnabled(): Promise<boolean>;

    /**
     * Specifies whether Product subscribe is delegated to external system.
     */
    isSubscriptionDelegationEnabled(): Promise<boolean>;
}