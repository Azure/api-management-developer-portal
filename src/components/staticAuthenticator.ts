import { IAuthenticator } from "../authentication";
import { HttpHeader } from "@paperbits/common/http/httpHeader";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;

    public async getAccessToken(): Promise<string> {
        return this.accessToken;
    }

    public async setAccessToken(token: string): Promise<void> {
        this.accessToken = token;
    }

    public async refreshAccessTokenFromHeader(responseHeaders: HttpHeader[] = []): Promise<string> {
        const accessTokenHeader = responseHeaders.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");
        if (accessTokenHeader && accessTokenHeader.value) {
            const regex = /token=\"(.*)",refresh/gm;
            const match = regex.exec(accessTokenHeader.value);

            if (!match || match.length < 2) {
                console.error(`Token format is not valid.`);
            }

            const accessToken = `SharedAccessSignature ${accessTokenHeader.value}`;
            const current = this.accessToken;
            if (current !== accessToken) {
                this.accessToken = accessToken;                
                return accessToken;
            }
        }
        return undefined;
    }

    public async clearAccessToken(): Promise<void> {
        this.accessToken = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();
        return !!accessToken;
    }
}