export interface AadB2CClientConfig {
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

    /**
     * Sign-in policy name. Only applies to AAD B2C identity provider.
     */
    signinPolicyName: string;

    /**
     * Sign-up policy name. Only applies to AAD B2C identity provider.
     */
    signupPolicyName: string;

    /**
     * Password reset policy name. Only applies to AAD B2C identity provider.
     */
    passwordResetPolicyName: string;
}