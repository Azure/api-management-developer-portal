import { EventManager } from "@paperbits/common/events";
import { IAuthenticator, AccessToken } from "./../authentication";

export class DefaultAuthenticator implements IAuthenticator {
    constructor(private readonly eventManager: EventManager) { }

    private runSsoFlow(): Promise<void> {
        return new Promise<void>(async () => {
            const url = new URL(location.href);
            const queryParams = new URLSearchParams(url.search);
            const tokenValue = queryParams.get("token");
            const tokenString = `SharedAccessSignature ${tokenValue}`;
            const token = AccessToken.parse(tokenString);

            await this.setAccessToken(token);

            const returnUrl = queryParams.get("returnUrl") || "/";

            // wait for redirect to happen, deliberatly not resolving the promise
            window.location.assign(returnUrl);
        });
    }

    public async getAccessToken(): Promise<AccessToken> {
        if (location.pathname.startsWith("/signin-sso")) {
            await this.runSsoFlow();
        }

        const storedToken = sessionStorage.getItem("accessToken");

        if (storedToken) {
            const accessToken = AccessToken.parse(storedToken);

            if (!accessToken.isExpired()) {
                return accessToken;
            }
        }

        return null;
    }

    public async getAccessTokenAsString(): Promise<string> {
        const accessToken = await this.getAccessToken();
        return accessToken?.toString();
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        if (accessToken.isExpired()) {
            console.warn(`Cannot set expired access token.`);
            return;
        }

        sessionStorage.setItem("accessToken", accessToken.toString());
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem("accessToken");
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessTokenAsString();

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