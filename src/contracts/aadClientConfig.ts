export interface AadClientConfig {
    /**
     * Client ID of the Application in the external Identity Provider.
     * It is App ID for Facebook login, Client ID for Google login, App ID for Microsoft.
     */
    clientId: string;

    /**
     * OpenID Connect discovery endpoint hostname for AAD or AAD B2C, e.g. login.windows.net
     */
    authority: string;

    /**
     * The TenantId to use instead of Common when logging into Active Directory.
     */
    signinTenant: string;
}