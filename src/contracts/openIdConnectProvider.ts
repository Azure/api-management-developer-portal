import { ArmResource } from "./armResource";

/**
 * ARM OpenId Connect Provider details.
 */
export interface OpenIdConnectProviderArmContract extends ArmResource {
    properties: OpenIdConnectProviderContract;
}

/**
 * OpenId Connect Provider details.
 */
export interface OpenIdConnectProviderContract {
    /**
   * User-friendly OpenID Connect Provider name.
   */
    name: string;

    /**
    * User-friendly OpenID Connect Provider name.
    */
    displayName: string;

    /**
     * User-friendly description of OpenID Connect Provider.
     */
    description: string;

    /**
     * Metadata endpoint URI.
     */
    metadataEndpoint: string;

    /**
     * Client ID of developer console which is the client application.
     */
    clientId: string;

    /**
     * Client Secret of developer console which is the client application.
     */
    clientSecret: string;
}
