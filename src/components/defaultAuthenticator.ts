import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from "./../authentication";
import { HttpHeader } from "@paperbits/common/http/httpHeader";

export class DefaultAuthenticator implements IAuthenticator {
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
    }

    public async refreshAccessTokenFromHeader(responseHeaders: HttpHeader[] = []): Promise<string> {
        const accessTokenHeader = responseHeaders.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (accessTokenHeader?.value) {
            const accessToken = AccessToken.parse(accessTokenHeader.value);
            const accessTokenString = accessToken.toString();

            const current = sessionStorage.getItem("accessToken");

            if (current !== accessTokenString) {
                sessionStorage.setItem("accessToken", accessTokenString);
                return accessTokenString;
            }
        }

        return undefined;
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