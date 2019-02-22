import { ServiceDescriptionContract } from "../contracts/service";
import { TenantSettings } from "../contracts/tenantSettings";
import { MapiClient } from "./mapiClient";
import { ServiceDescription } from "../models/service";
import { HostType } from "../constants";

export class TenantService {
    constructor(
        private readonly smapiClient: MapiClient
    ) {
    }

    private async getServiceDescription(): Promise<ServiceDescription> {
        // return await this.smapiClient.executeGet<ServiceDescription>("");

        const contract = {
            id: "",
            tags: {},
            eTag: "local",
            location: "West US",
            masterLocation: "West US",
            name: "local",
            properties: {
                addresserEmail: "admin@apim.net",
                createdAtUtc: new Date(),
                managementApiUrl: "https://aztest.management.azure-api.net",
                portalUrl: "https://portal.apim.net",
                provisioningState: "Succeeded",
                targetProvisioningState: null,
                publisherEmail: "admin@apim.net",
                publisherName: "Admin",
                runtimeUrl: "https://aztest.azure-api.net",
                scmUrl: "https://scm.apim.net",
                gatewayUrl: "https://aztest.azure-api.net",
                staticIps: ["127.0.0.1"],
                virtualNetworkType: 0,
                hostnameConfigurations: [],
                additionalLocations: []
            },
            resourceGroupName: "devenv",
            resourceType: "Microsoft.ApiManagement/service",
            sku: {
                name: "Developer",
                capacity: 1
            }
        };

        return new ServiceDescription(<any>contract);
    }

    public async getSettings(): Promise<TenantSettings> {
        const result = await this.smapiClient.get("/tenant/settings");
        return result && result["settings"];
    }

    public async getServiceName(): Promise<string> {
        const service = await this.getServiceDescription();
        return service.name;
    }

    public async getServiceSkuName(): Promise<string> {
        const service = await this.getServiceDescription();
        return service.sku.name;
    }

    public async getServiceMasterKey(): Promise<string> {
        return "MasterKey";

        // const service = await this.getServiceDescription();

        // if (service.sku.name === ServiceSkuName.Consumption) {
        //     const subscription = await this.smapiClient.executeGet<Subscription>(`${service.id}/subscriptions/master`);
        //     return subscription && subscription.primaryKey;
        // }
        // return undefined;
    }

    public async getProxyHostnames(): Promise<string[]> {
        const service = await this.getServiceDescription();

        if (!service) {
            throw new Error("Unable to get proxy hostname.");
        }

        const configs = service.hostnameConfigurations;

        if (configs.length && configs.length > 0) {
            const hostnames = configs.filter((config) => config.type === HostType.Proxy).map(x => x.hostName);

            if (hostnames.length > 0) {
                return hostnames;
            }
        }
        return [service.gatewayUrl.split("/")[2]];
    }

    public async getPortalHostname(): Promise<string> {
        return "portal.host.name";

        // const service = await this.getServiceDescription();

        // if (service && service.properties) {
        //     const configs = service.hostnameConfigurations;

        //     if (configs.length && configs.length > 0) {
        //         const config = configs.find(entry => entry.type === HostType.Portal);

        //         if (config) {
        //             return config.hostName;
        //         }
        //     }

        //     return service.portalUrl && service.portalUrl.split("/")[2];
        // }
        // else {
        //     return null;
        // }
    }

    public async getManagementHostname(): Promise<string> {
        return "management.host.name";

        // const service = await this.getServiceDescription();

        // if (service && service.properties) {
        //     const configs = service.hostnameConfigurations;

        //     if (configs.length && configs.length > 0) {
        //         const config = configs.find(entry => entry.type === HostType.Mapi);

        //         if (config) {
        //             return config.hostName;
        //         }
        //     }
        //     return service.managementApiUrl.split("/")[2];
        // }
        // else {
        //     return null;
        // }
    }
}