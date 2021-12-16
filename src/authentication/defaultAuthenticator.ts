import * as Constants from "./../constants";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { AccessToken, IAuthenticator } from "./../authentication";


export class DefaultAuthenticator implements IAuthenticator {
    private runSsoFlow(): Promise<void> {
        return new Promise<void>(async () => {
            const url = new URL(location.href);
            let tokenValue = url.searchParams.get("token");
            let returnUrl = url.searchParams.get("returnUrl") || "/";
            if (!tokenValue && url.hash.startsWith("#token=")) {
                const hashParams = new URLSearchParams(url.hash.replace(/#/g, "?"));
                tokenValue = hashParams.get("token");
                returnUrl = hashParams.get("returnUrl") || returnUrl || "/";
            }
            const tokenString = `SharedAccessSignature ${tokenValue}`;
            const token = AccessToken.parse(tokenString);

            await this.setAccessToken(token);

            // wait for redirect to happen, deliberatly not resolving the promise
            window.location.assign(sanitizeUrl(returnUrl));
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
            else {
                this.clearAccessToken();
                alert("You session expired. Please sign-in again.");
                window.location.assign(Constants.pageUrlSignIn);
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