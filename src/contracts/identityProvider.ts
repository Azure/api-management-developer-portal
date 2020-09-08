import { ArmResource } from "./armResource";

/**
 * Contract that describes identity provider used for user authentication.
 */
export interface IdentityProviderContract extends ArmResource {
    properties: IdentityProviderProperties;
}

export interface IdentityProviderProperties {
    /**
     * Client ID of the Application in the external Identity Provider.
     * It is App ID for Facebook login, Client ID for Google login, App ID for Microsoft.
     */
    clientId: string;

    /**
     * Client secret of the Application in external Identity Provider, used to authenticate login request.
     * For example, it is App Secret for Facebook login, API Key for Google login, Public Key for Microsoft.
     */
    clientSecret: string;

    /**
     * Identity Provider Type identifier, e.g. "aad", "aadB2C", "facebook", "google", "microsoft", "twitter".
     */
    type: string;

    /**
     * OpenID Connect discovery endpoint hostname for AAD or AAD B2C, e.g. login.windows.net
     */
    authority: string;

    /**
     * List of Allowed Tenants when configuring Azure Active Directory login, e.g. mytenant.onmicrosoft.com
     */
    allowedTenants: string[];

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