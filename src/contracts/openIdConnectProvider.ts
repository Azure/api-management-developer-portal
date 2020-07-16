import { ArmResource } from "./armResource";

/**
 * OpenId Connect Provider details.
 */
export interface OpenIdConnectProviderContract extends ArmResource {
    properties: OpenIdConnectProviderProperties;
}

export interface OpenIdConnectProviderProperties {
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