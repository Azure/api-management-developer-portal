export interface OpenIdConnectProviderContract {
    /**
     * User-friendly OpenID Connect Provider name.
     */
    name: string;

    /**
     * User-friendly description of OpenID Connect Provider.
     */
    description: string;

    /**
     * Metadata endpoint URI.
     */
    metadataEndpoint: string;
}