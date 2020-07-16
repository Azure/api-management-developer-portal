import { OpenIdConnectProviderContract } from "../contracts/openIdConnectProvider";

export class OpenIdConnectProvider {
    constructor(contract: OpenIdConnectProviderContract) {
        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.description = contract.properties.description;
        this.clientId = contract.properties.clientId;
        this.metadataEndpoint = contract.properties.metadataEndpoint;
    }

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