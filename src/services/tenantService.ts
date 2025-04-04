import { ArmResource } from "../contracts/armResource";
import { PortalConfig } from "../contracts/portalConfig";
import { IApiClient } from "../clients";
import ITenantService from "./ITenantService";
import { PortalConfigDelegationSecrets } from "../contracts/portalConfigDelegation";

/**
 * A service for management operations with Data API tenant.
 */
export class TenantService implements ITenantService {
    constructor(private readonly apiClient: IApiClient) { }

    /**
     * Returns tenant settings.
     */
    public async getSettings(): Promise<PortalConfig> {
        const result = await this.apiClient.get<ArmResource>("/portalConfigs/default", [await this.apiClient.getPortalHeader("getPortalConfig")]);
        const config = result?.properties as PortalConfig;
        if (config?.delegation?.delegateRegistration || config?.delegation?.delegateSubscription) {
            const result = await this.getDelegationSecrets();
            if (result) {
                config.delegation.validationKey = result.validationKey;
                config.delegation.validationSecondaryKey = result.validationSecondaryKey;
            } else {
                console.warn("Delegation is enabled but no secrets found");
            }
        }
        return config;
    }

    public async getDelegationSecrets(): Promise<PortalConfigDelegationSecrets> {
        const result = await this.apiClient.post<any>("/portalConfigs/default/listDelegationSecrets", [await this.apiClient.getPortalHeader("getDelegationSecrets")]);
        return result;
    }

    public async getMediaContentBlobUrl(): Promise<string> {
        const result = await this.apiClient.post<any>("/portalConfigs/default/listMediaContentSecrets", [await this.apiClient.getPortalHeader("getStorageSasUrl")]);
        return result?.containerSasUrl || result?.properties.containerSasUrl;
    }

    public async isDelegationEnabled(): Promise<boolean> {
        const config = await this.getSettings();
        return config?.delegation?.delegateRegistration;
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const config = await this.getSettings();
        return config?.delegation?.delegateSubscription;
    }

    // Do not supported in Data API
    public async getServiceSkuName(): Promise<string> {
        const result = await this.apiClient.get<ArmResource>("/");
        return result?.sku?.name || "Developer";
    }
}