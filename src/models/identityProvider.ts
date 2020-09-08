import { IdentityProviderContract } from "../contracts/identityProvider";

/**
 * Model for identity provider used for user authentication.
 */
export class IdentityProvider {
    /**
     * Client ID of the Application in the external Identity Provider.
     * It is App ID for Facebook login, Client ID for Google login, App ID for Microsoft.
     */
    public clientId: string;

    /**
     * Client secret of the Application in external Identity Provider, used to authenticate login request.
     * For example, it is App Secret for Facebook login, API Key for Google login, Public Key for Microsoft.
     */
    public clientSecret: string;

    /**
     * Identity Provider Type identifier, e.g. "aad", "aadB2C", "facebook", "google", "microsoft", "twitter".
     */
    public type: string;

    /**
     * OpenID Connect discovery endpoint hostname for AAD or AAD B2C, e.g. login.windows.net
     */
    public authority: string;

    /**
     * List of Allowed Tenants when configuring Azure Active Directory login, e.g. mytenant.onmicrosoft.com
     */
    public allowedTenants: string[];

    /**
     * The TenantId to use instead of Common when logging into Active Directory.
     */
    public signinTenant: string;

    /**
     * Sign-in policy name. Only applies to AAD B2C identity provider.
     */
    public signinPolicyName: string;

    /**
     * Sign-up policy name. Only applies to AAD B2C identity provider.
     */
    public signupPolicyName: string;

    /**
     * Password reset policy name. Only applies to AAD B2C identity provider.
     */
    public passwordResetPolicyName: string;

    constructor(contract?: IdentityProviderContract) {
        if (!contract) {
            return;
        }

        this.clientId = contract.properties.clientId;
        this.clientSecret = contract.properties.clientSecret;
        this.authority = contract.properties.authority;
        this.type = contract.properties.type;
        this.allowedTenants = contract.properties.allowedTenants;
        this.signinTenant = contract.properties.signinTenant;
        this.signinPolicyName = contract.properties.signinPolicyName;
        this.signupPolicyName = contract.properties.signupPolicyName;
        this.passwordResetPolicyName = contract.properties.passwordResetPolicyName;
    }
}