import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ISettingsProvider } from "@paperbits/common/configuration";


/**
 * A service for management operations with API Management tenant.
 */
export class TenantService {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Returns tenant settings.
     */
    public async getSettings(): Promise<TenantSettings> {
        /* TODO: User proper service container */
        const result = await this.mapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

    /**
     * Returns API Management service name.
     */
    public async getServiceName(): Promise<string> {
        /* TODO: User proper service container */
        const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        const regex = /https:\/\/([\w\-]*)\./gm;
        const match = regex.exec(managementApiUrl);

        if (match && match.length > 0) {
            const serviceName = match[1];
            return serviceName;
        }
        else {
            return "";
        }
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
        /* TODO: User proper service container */
        const serviceName = await this.getServiceName();
        return [`${serviceName}.azure-api.net`];
    }
}