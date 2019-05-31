import { ServiceDescriptionContract } from "../contracts/service";
import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ServiceDescription } from "../models/service";
import { HostType } from "../constants";

export class TenantService {
    constructor(private readonly smapiClient: MapiClient) { }

    private async getServiceDescription(): Promise<ServiceDescription> {
        return await this.smapiClient.get<ServiceDescription>("/");
    }

    public async getSettings(): Promise<TenantSettings> {
        const result = await this.smapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

    public async getServiceName(): Promise<string> {
        const settings = await this.getSettings();
        return settings.ProxyHostName.split(".").shift();
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
        const settings = await this.getSettings();
        return [settings.ProxyHostName];
    }
}