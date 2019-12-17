import { IAuthenticator } from "../authentication";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;

    public async getAccessToken(): Promise<string> {
        return this.accessToken;
    }

    public async setAccessToken(token: string): Promise<void> {
        this.accessToken = token;
    }

    public async clearAccessToken(): Promise<void> {
        this.accessToken = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();
        return !!accessToken;
    }
}