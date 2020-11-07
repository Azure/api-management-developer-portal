import { IAuthenticator, AccessToken } from "../authentication";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;

    public async getAccessToken(): Promise<string> {
        return this.accessToken;
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        this.accessToken = accessToken.toString();
    }

    public clearAccessToken(): void {
        this.accessToken = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();
        return !!accessToken;
    }
}