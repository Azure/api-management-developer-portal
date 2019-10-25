import { TenantSettings, DelegationParameters, DelegationAction } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ISettingsProvider } from "@paperbits/common/configuration";
import * as nodeCrypto from "crypto";
import { HttpClient } from "@paperbits/common/http/httpClient";

/**
 * A service for management operations with API Management tenant.
 */
export class TenantService {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Returns tenant settings.
     */
    public async getSettings(): Promise<TenantSettings> {
        const result = await this.mapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

    /**
     * Returns API Management service name.
     */
    public async getServiceName(): Promise<string> {
        return location.hostname;

        // /* TODO: User proper service container */
        // const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        // const regex = /https:\/\/([\w\-]*)\./gm;
        // const match = regex.exec(managementApiUrl);

        // if (match && match.length > 0) {
        //     const serviceName = match[1];
        //     return serviceName;
        // }
        // else {
        //     return "";
        // }
    }

    /**
     * Returns API Management service SKU name.
     * TODO: Not implemented.
     */
    public async getServiceSkuName(): Promise<string> {
        return "Developer";
    }

    /**
     * Returns API Management service master key.
     * TODO: Not implemented.
     */
    public async getServiceMasterKey(): Promise<string> {
        return undefined;

        // const service = await this.getServiceDescription();

        // if (service.sku.name === ServiceSkuName.Consumption) {
        //     const subscription = await this.mapiClient.executeGet<Subscription>(`${service.id}/subscriptions/master`);
        //     return subscription && subscription.primaryKey;
        // }
        // return undefined;
    }

    /**
     * Returns gateway hostnames.
     * TODO: Not implemented.
     */
    public async getProxyHostnames(): Promise<string[]> {
        const setting = await this.settingsProvider.getSetting<string>("proxyHostnames");
        const hostnames = setting ? setting.split(";") : [];
        return hostnames;
    }

    public async isDelegationEnabled(loadedSettings?: TenantSettings): Promise<boolean> {
        const tenantSettings = loadedSettings || await this.getSettings();
        return tenantSettings && tenantSettings["CustomPortalSettings.DelegationEnabled"] && tenantSettings["CustomPortalSettings.DelegationEnabled"].toLowerCase() === "true";
    }

    public async isSubscriptionDelegationEnabled(): Promise<boolean> {
        const tenantSettings = await this.getSettings();
        const delegationEnabled = await this.isDelegationEnabled(tenantSettings);
        return delegationEnabled && tenantSettings["CustomPortalSettings.DelegatedSubscriptionEnabled"] && tenantSettings["CustomPortalSettings.DelegatedSubscriptionEnabled"].toLowerCase() === "true";
    }
}