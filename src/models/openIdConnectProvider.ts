import { OpenIdConnectProviderContract } from "../contracts/openIdConnectProvider";

export class OpenIdConnectProvider {
    constructor(contract: OpenIdConnectProviderContract) {
        this.name = contract.name;
        this.displayName = contract.name;
        this.description = contract.description;
        this.metadataEndpoint = contract.metadataEndpoint;
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