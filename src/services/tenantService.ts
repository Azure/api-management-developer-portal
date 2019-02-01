import { ServiceDescription } from "../contracts/service";
import { TenantSettings } from "../contracts/tenantSettings";
import { SmapiClient } from "./smapiClient";

export class TenantService {
    constructor(
        private readonly smapiClient: SmapiClient
    ) {
    }

    private async getServiceDescription(): Promise<ServiceDescription> {
        // return await this.smapiClient.executeGet<ServiceDescription>("");

        return <any>{
            id: "",
            tags: {},
            eTag: "local",
            location: "West US",
            masterLocation: "West US",
            name: "local",
            properties: {
                addresserEmail: "admin@apim.net",
                createdAtUtc: new Date(),
                managementApiUrl: "https://management.apim.net",
                portalUrl: "https://portal.apim.net",
                provisioningState: "Succeeded",
                targetProvisioningState: null,
                publisherEmail: "admin@apim.net",
                publisherName: "Admin",
                runtimeUrl: "https://proxy.apim.net",
                scmUrl: "https://scm.apim.net",
                gatewayUrl: "https://proxy.apim.net",
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
        }
    }

    public async getSettings(): Promise<TenantSettings> {
        const result =  await this.smapiClient.get("/tenant/settings");
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
        return ["proxy.host.name"];

        // const service = await this.getServiceDescription();

        // if (service && service.properties) {
        //     const configs = service.hostnameConfigurations;

        //     if (configs.length && configs.length > 0) {
        //         const hostnames = configs.filter((config) => config.type === HostType.Proxy).map(x => x.hostName);

        //         if (hostnames.length > 0) {
        //             return hostnames;
        //         }
        //     }
        //     return [service.gatewayUrl.split("/")[2]]; // extracting aztest.azure-api.net
        // }

        // throw new Error("Unable to get proxy hostname.");
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