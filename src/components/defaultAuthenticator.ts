import { IAuthenticator, AccessToken } from "./../authentication";

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