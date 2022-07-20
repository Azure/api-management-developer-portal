import { IAuthenticator, AccessToken } from "../authentication";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;

    public async getAccessToken(): Promise<AccessToken> {
        if (this.accessToken)
            return AccessToken.parse(this.accessToken.toString());
        else
            return null
    }

    public async getAccessTokenAsString(): Promise<string> {
        return this.accessToken?.toString();
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        this.accessToken = accessToken;
    }

    public clearAccessToken(): void {
        this.accessToken = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessTokenAsString();
        return !!accessToken;
    }
}