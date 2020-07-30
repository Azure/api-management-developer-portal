import { HttpHeader } from "@paperbits/common/http/httpHeader";
import { IAuthenticator, AccessToken } from "../authentication";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;

    public async getAccessToken(): Promise<string> {
        return this.accessToken;
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        this.accessToken = accessToken.toString();
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
        this.accessToken = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();
        return !!accessToken;
    }
}