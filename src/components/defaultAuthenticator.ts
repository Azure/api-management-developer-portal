import { EventManager } from "@paperbits/common/events";
import { IAuthenticator, AccessToken } from "./../authentication";

export class DefaultAuthenticator implements IAuthenticator {
    constructor(private readonly eventManager: EventManager) { }

    public async getAccessToken(): Promise<string> {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!accessToken && window.location.pathname.startsWith("/signin-sso")) {
            const url = new URL(location.href);
            const queryParams = new URLSearchParams(url.search);
            const tokenValue = queryParams.get("token");
            const token = AccessToken.parse(`SharedAccessSignature ${tokenValue}`);
            await this.setAccessToken(token);

            const returnUrl = queryParams.get("returnUrl") || "/";
            window.location.assign(returnUrl);
        }
        return accessToken;
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        if (accessToken.isExpired()) {
            console.warn(`Cannot set expired access token.`);
            return;
        }

        sessionStorage.setItem("accessToken", accessToken.toString());

        const expiresInMs = accessToken.expiresInMs();
        const refreshBufferMs = 5 * 60 * 1000; // 5 min
        const nextRefreshInMs = expiresInMs - refreshBufferMs;

        if (expiresInMs < refreshBufferMs) {
            // Refresh immediately
            this.eventManager.dispatchEvent("authenticated"); 
        }
        else {
            // Schedule refresh 5 min before expiration.
            setTimeout(() => this.eventManager.dispatchEvent("authenticated"), nextRefreshInMs);
        }
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem("accessToken");
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return false;
        }

        const parsedToken = AccessToken.parse(accessToken);

        if (!parsedToken) {
            return false;
        }

        return !parsedToken.isExpired();
    }
}