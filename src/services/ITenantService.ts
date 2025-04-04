/**
 * A service for management operations with API Management/Data API tenant.
 */
export default interface ITenantService {
    /**
     * Returns API Management service SKU name.
     */
    getServiceSkuName(): Promise<string>;
}