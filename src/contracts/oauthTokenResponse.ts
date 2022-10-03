export interface OAuthTokenResponse {
    /**
     * Access token.
     */
    access_token: string;

    /**
     * Type of the access token, e.g. `Bearer`.
     */
    token_type: string;

    /**
     * Expiration date and time, e.g. `1663205603`
     */
    expires_on: string;

    /**
     * Base64-encoded ID token.
     */
    id_token: string;

    /**
     * Refresh token.
     */
    refresh_token: string;
}