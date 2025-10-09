import { IAuthenticator, AccessToken } from ".";

/**
 * Static implementation of the IAuthenticator interface to mimic actual authentication in publish time.
 */
export class StaticAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;

    constructor() {
        /*
         * The ARM token injected acquired in build-time. It's used in on local development only.
         * TODO: Static authenticator is used in production publishing, therefore it's safer to introduce dedicated implementation.
         */
        if (!ARM_TOKEN) {
            return;
        }

        const token = AccessToken.parse(ARM_TOKEN);
        this.accessToken = token;
    }

    public async getAccessToken(): Promise<AccessToken> {
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