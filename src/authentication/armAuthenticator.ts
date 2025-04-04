import * as Constants from "../constants";
import { AccessToken, IAuthenticator } from ".";

const ARM_TOKEN = "armAccessToken";

export class SelfHostedArmAuthenticator implements IAuthenticator {
    public async getAccessToken(): Promise<AccessToken> {
        const storedToken = sessionStorage.getItem(ARM_TOKEN);

        if (storedToken) {
            const accessToken = AccessToken.parse(storedToken);

            if (!accessToken.isExpired()) {
                return accessToken;
            }
            else {
                this.clearAccessToken();
                alert("You session expired. Please sign-in again.");
                window.location.assign(Constants.pageUrlSignIn);
            }
        } else {
            if (process.env.ARM_TOKEN) {
                const token = AccessToken.parse(process.env.ARM_TOKEN);
                await this.setAccessToken(token);
                return token;
            } else {
                alert("ARM token was not provided. Please sign-in.");
            }
        }

        return null;
    }

    public getStoredAccessToken(): AccessToken {
        const storedToken = sessionStorage.getItem(ARM_TOKEN);

        if (storedToken) {
            const accessToken = AccessToken.parse(storedToken);

            if (!accessToken.isExpired()) {
                return accessToken;
            } else {
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
        sessionStorage.setItem(ARM_TOKEN, accessToken.toString());
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem(ARM_TOKEN);
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return false;
        }

        return !accessToken.isExpired();
    }
}