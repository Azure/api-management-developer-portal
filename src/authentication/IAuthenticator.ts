import { AccessToken } from "./accessToken";
import { HttpHeader } from "@paperbits/common/http/httpHeader";

export interface IAuthenticator {
    /**
     * Returns access token for current session.
     */
    getAccessToken(): Promise<string>;

    /**
     * Sets new token for the session.
     * @param accessToken {string} Access token in SharedAccessSignature or Bearer token format.
     */
    setAccessToken(accessToken: string): Promise<void>;

    /**
     * Sets new token for the session from response header and return refreshed value
     * @param responseHeaders {HttpHeader[]} Response headers.
     */
    refreshAccessTokenFromHeader(responseHeaders: HttpHeader[]): Promise<string>;

    /**
     * Parses specified access token.
     * @param accessToken 
     */
    parseAccessToken?(accessToken: string): AccessToken;

    /**
     * Clears access token from current session.
     */
    clearAccessToken(): Promise<void>;

    /**
     * Checks if current user is signed in.
     */
    isAuthenticated(): Promise<boolean>;
}