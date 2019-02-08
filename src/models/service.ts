import { ServiceDescriptionContract, HostnameConfiguration, ServiceSku } from "./../contracts/service";

export class ServiceDescription {
    public name: string;
    public hostnameConfigurations: HostnameConfiguration[];
    public sku: ServiceSku;
    public gatewayUrl: string;

    constructor(contract: ServiceDescriptionContract) {
        this.name = contract.name;
        this.sku = contract.sku;
        this.gatewayUrl = contract.properties.gatewayUrl;
        this.hostnameConfigurations = contract.properties.hostnameConfigurations;
    }
}