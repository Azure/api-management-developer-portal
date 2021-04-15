import { AccessToken } from "./accessToken";

export interface IAuthenticator {
    /**
     * Returns access token as a string.
     */
    getAccessTokenAsString(): Promise<string>;

    /**
     * Returns access token for current session.
     */
    getAccessToken(): Promise<AccessToken>;

    /**
     * Sets new token for the session.
     * @param accessToken {string} Access token in SharedAccessSignature or Bearer token format.
     */
    setAccessToken(accessToken: AccessToken): Promise<void>;

    /**
     * Clears access token from current session.
     */
    clearAccessToken(): void;

    /**
     * Checks if current user is signed in.
     */
    isAuthenticated(): Promise<boolean>;
}