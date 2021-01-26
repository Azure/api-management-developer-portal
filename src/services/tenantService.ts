import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";

/**
 * A service for management operations with API Management tenant.
 */
export class TenantService {
    private cachedSettings: any;
    constructor(private readonly mapiClient: MapiClient) { }

    /**
     * Returns tenant settings.
     */
    public async getSettings(): Promise<TenantSettings> {
        if (this.cachedSettings) {
            return this.cachedSettings;
        }
        const result = await this.mapiClient.get("/tenant/settings");
        this.cachedSettings = result && result["settings"];

        // cache settings for 10 sec
        setTimeout(() => {
            this.cachedSettings = undefined;
        }, 10000);
        
        return this.cachedSettings;
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