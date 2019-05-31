import { ServiceDescriptionContract } from "../contracts/service";
import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ServiceDescription } from "../models/service";
import { HostType } from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class TenantService {
    constructor(
        private readonly smapiClient: MapiClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    private async getServiceDescription(): Promise<ServiceDescription> {
        return await this.smapiClient.get<ServiceDescription>("/");
    }

    public async getSettings(): Promise<TenantSettings> {
        /* TODO: User proper service container */
        const result = await this.smapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

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

    public async getServiceSkuName(): Promise<string> {
        return "Developer";
    }

    public async getServiceMasterKey(): Promise<string> {
        return undefined;

        // const service = await this.getServiceDescription();

        // if (service.sku.name === ServiceSkuName.Consumption) {
        //     const subscription = await this.smapiClient.executeGet<Subscription>(`${service.id}/subscriptions/master`);
        //     return subscription && subscription.primaryKey;
        // }
        // return undefined;
    }

    public async getProxyHostnames(): Promise<string[]> {
        /* TODO: User proper service container */
        const serviceName = await this.getServiceName();
        return [`${serviceName}.azure-api.net`];
    }
}