export interface OpenIdConnectServer {
    name: string;
    description: string;
    metadataEndpoint: string;
    clientId: string;
    clientSecret: string;
}