import { OpenIdConnectProviderContract, OpenIdConnectProviderArmContract } from "../contracts/openIdConnectProvider";

export class OpenIdConnectProvider {
    /**
     * Resource name.
     */
    public name: string;

    /**
     * User-friendly OpenID Connect Provider name.
     */
    public displayName: string;

    /**
     * User-friendly description of OpenID Connect Provider.
     */
    public description: string;

    /**
     * Metadata endpoint URI.
     */
    public metadataEndpoint: string;

    /**
     * Client ID of developer console which is the client application.
     */

    public clientId: string;
}
export class OpenIdConnectProviderDataApi extends OpenIdConnectProvider {
    constructor(contract: OpenIdConnectProviderContract) {
        super()
        this.name = contract.name;
        this.displayName = contract.name;
        this.description = contract.description;
        this.clientId = contract.clientId;
        this.metadataEndpoint = contract.metadataEndpoint;
    }
}

export class OpenIdConnectProviderArm extends OpenIdConnectProvider {
    constructor(contract: OpenIdConnectProviderArmContract) {
        super()
        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.description = contract.properties.description;
        this.clientId = contract.properties.clientId;
        this.metadataEndpoint = contract.properties.metadataEndpoint;
    }
}