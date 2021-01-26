import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";

/**
 * A service for management operations with API Management tenant.
 */
export class TenantService {
    constructor(private readonly mapiClient: MapiClient) { }

    /**
     * Returns tenant settings.
     */
    public async getSettings(): Promise<TenantSettings> {
        const result = await this.mapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

    /**
     * Returns API Management service SKU name.
     * TODO: Not implemented.
     */
    public async getServiceSkuName(): Promise<string> {
        return "Developer";
    }

    public async isDelegationEnabled(loadedSettings?: TenantSettings): Promise<boolean> {
        const tenantSettings = loadedSettings || await this.getSettings();
        return tenantSettings && tenantSettings["CustomPortalSettings.DelegationEnabled"] && tenantSettings["CustomPortalSettings.DelegationEnabled"].toLowerCase() === "true";
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const tenantSettings = await this.getSettings();
        return tenantSettings["CustomPortalSettings.DelegatedSubscriptionEnabled"] && tenantSettings["CustomPortalSettings.DelegatedSubscriptionEnabled"].toLowerCase() === "true";
    }
}