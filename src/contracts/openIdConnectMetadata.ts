export interface OpenIdConnectMetadata {
    /**
     * e.g. "https://sts.windows.net/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
     */
    issuer: string;

    /**
     * e.g. "https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/oauth2/v2.0/authorize".
     */
    authorization_endpoint: string;

    /**
     * e.g. "https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/oauth2/token".
     */
    token_endpoint: string;

    /**
     * e.g. "openid".
     */
    scopes_supported: string[];

    /**
     * e.g. "code", "id_token", "code id_token", "token id_token", "token".
     */
    response_types_supported: string[];

    /**
     * e.g. "query", "fragment", "form_post".
     */
    response_modes_supported: string[];

    /**
     * e.g. "authorization_code", "implicit".
     */
    grant_types_supported: string[];

    /**
     *  e.g. "client_secret_post", "private_key_jwt", "client_secret_basic".
     */
    token_endpoint_auth_methods_supported: string[];
}