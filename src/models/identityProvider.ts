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

    constructor(contract?: IdentityProviderContract) {
        if (!contract) {
            return;
        }

        this.clientId = contract.properties.clientId;
        this.clientSecret = contract.properties.clientSecret;
        this.authority = contract.properties.authority;
        this.type = contract.properties.type;
        this.allowedTenants = contract.properties.allowedTenants;
    }
}