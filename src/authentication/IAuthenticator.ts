import { AccessToken } from "./accessToken";

export interface IAuthenticator {
    /**
     * Returns access token for current session.
     */
    getAccessToken(): string;

    /**
     * Sets new token for the session.
     * @param accessToken {string} Access token in SharedAccessSignature or Bearer token format.
     */
    setAccessToken(accessToken: string): void;

    /**
     * Parses specified access token.
     * @param accessToken 
     */
    parseAccessToken?(accessToken: string): AccessToken;

    /**
     * Returns authenticated user identifier.
     */
    getUser(): string;

    /**
     * Sets user for current secction
     * @param userId 
     */
    setUser(userId: string): void;

    /**
     * Clears access token from current session.
     */
    clearAccessToken(): void;

    /**
     * Checks if current user is signed in.
     */
    isUserSignedIn(): boolean;
}