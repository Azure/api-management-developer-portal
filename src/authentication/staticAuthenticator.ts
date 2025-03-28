import { IAuthenticator, AccessToken } from ".";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;

    public async getAccessToken(): Promise<AccessToken> {
        if (!this.accessToken) {
            if (process.env.ARM_TOKEN) {
                const token = AccessToken.parse(process.env.ARM_TOKEN);
                this.accessToken = token;
            } else {
                console.log("Token was not provided. Please sign-in.");
            }
        }
        return this.accessToken;
    }

    public getStoredAccessToken(): AccessToken {
        return this.accessToken;
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