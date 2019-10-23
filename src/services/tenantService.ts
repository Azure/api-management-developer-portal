import { TenantSettings, DelegationParameters, DelegationAction } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ISettingsProvider } from "@paperbits/common/configuration";
import * as nodeCrypto from "crypto";

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
        /* TODO: User proper service container */
        const serviceName = await this.getServiceName();
        return [`${serviceName}.azure-api.net`];
    }

    public async isDelegationEnabled(loadedSettings?: TenantSettings): Promise<boolean> {
        const tenantSettings = loadedSettings || await this.getSettings();
        return tenantSettings && tenantSettings["CustomPortalSettings.DelegationEnabled"] && tenantSettings["CustomPortalSettings.DelegationEnabled"].toLowerCase() === "true";
    }

    /**
     * Returns delegation config.
     */
    public async getDelegationUrl(action: DelegationAction, delegationParameters: {}, delegationUrl?: string): Promise<string> {
        const settings = await this.getSettings();
        const isDelegationEnabled = await this.isDelegationEnabled(settings);
        if (isDelegationEnabled) {
            if (!nodeCrypto) {
                console.warn("node Crypto lib was not found");
                return undefined;
            }
            const url = new URL(delegationUrl || settings["CustomPortalSettings.DelegationUrl"] || "");
            const queryParams = new URLSearchParams(url.search);

            const validationKey = settings["CustomPortalSettings.DelegationValidationKey"];
            const salt = nodeCrypto.randomBytes(32).toString("base64");
            const payload = [salt];
            Object.keys(delegationParameters).map(key => {
                const val = delegationParameters[key];
                queryParams.append(key, val);
                payload.push(val);
            });

            const hmac = nodeCrypto.createHmac("sha512", Buffer.from(validationKey, "base64"));
            const digest = hmac.update(payload.join("\n")).digest();
            const signature = digest.toString("base64");

            queryParams.append(DelegationParameters.Operation, action);
            queryParams.append(DelegationParameters.Salt, salt);
            queryParams.append(DelegationParameters.Signature, signature);

            return `${url.origin + url.pathname}?${queryParams.toString()}`;
        }
        return undefined;
    }

}