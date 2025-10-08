import { IAuthenticator, AccessToken } from ".";
import { HttpClient } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { SettingNames } from "../constants";

const accessTokenSetting = "accessToken";

export class SsoAuthenticator implements IAuthenticator {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) { }

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

            if (!returnUrl.startsWith("/") && !returnUrl.startsWith(location.origin)) {
                returnUrl = "/";
            }

            // wait for redirect to happen, deliberatly not resolving the promise
            window.location.assign(sanitizeUrl(returnUrl));
        });
    }

    /**
     * Check is access token can be restored from HTTP-only cookie is present
     */
    private async tryRestoreFromHttpOnlyCookie(): Promise<AccessToken> {
        const response = await this.httpClient.send<string>({ url: "/token", method: "GET" });

        if (response.statusCode !== 200) {
            return null;
        }

        try {
            const tokenValue = response.toText();
            const accessToken = AccessToken.parse(tokenValue);
            await this.setAccessToken(accessToken);

            return accessToken
        }
        catch (error) {
            return null;
        }
    }

    public async getAccessToken(): Promise<AccessToken> {
        try {
            if (location.pathname.startsWith("/signin-sso")) {
                await this.runSsoFlow();
            }

            const storedToken = this.getStoredAccessToken();

            if (storedToken) {
                return storedToken;
            }

            const serverToken = await this.tryRestoreFromHttpOnlyCookie();

            if (!serverToken) {
                return null;
            }

            return serverToken;
        }
        catch (error) {
            this.logger.trackError(error);
            return null;
        }
    }

    public getStoredAccessToken(): AccessToken {
        const storedToken = sessionStorage.getItem(accessTokenSetting);

        if (storedToken) {
            const accessToken = AccessToken.parse(storedToken);

            if (!accessToken.isExpired()) {
                return accessToken;
            }
            else {
                console.warn('%cAccess token expired.', 'font-weight: bold;');
                this.clearAccessToken();
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

        /* Setting up HTTP-only cookie only in published version*/
        if (!sessionStorage.getItem(SettingNames.designTimeSettings)) {
            await this.httpClient.send<any>({ url: "/sso-refresh", method: "GET", headers: [{ name: "Authorization", value: accessToken.value }] });
        }

        sessionStorage.setItem(accessTokenSetting, accessToken.toString());
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem(accessTokenSetting);
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = this.getStoredAccessToken() || await this.tryRestoreFromHttpOnlyCookie();

        return !!accessToken;
    }
}