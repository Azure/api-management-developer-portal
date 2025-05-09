import * as Constants from "../constants";
import { AccessToken, IAuthenticator } from ".";

const ARM_TOKEN = "armAccessToken";

interface ArmTokenData {
    token: string;
    username: string;
    expiresOn: number;
    tenantId: string;
    clientId: string;
    scope: string;
}

export class SelfHostedArmAuthenticator implements IAuthenticator {
    private initialTokenData: ArmTokenData;
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
                const tokenData: ArmTokenData = JSON.parse(process.env.ARM_TOKEN);
                this.initialTokenData = tokenData;
                if (!tokenData.token) {
                    alert("ARM token data can not be parsed. Please check authentication result.");
                    return null;
                }
                const token = AccessToken.parse(tokenData.token);
                await this.setAccessToken(token);
                return token;
            } else {
                alert("ARM token was not provided. Please sign-in.");
            }
        }

        return null;
    }

    public getLoginHint(): string {
        if (this.initialTokenData) {
            return this.initialTokenData.username;
        }
        return null;
    }

    public getTenantId(): string {
        if (this.initialTokenData) {
            return this.initialTokenData.tenantId;
        }
        return null;
    }

    public getClientId(): string {
        if (this.initialTokenData) {
            return this.initialTokenData.clientId;
        }
        return null;
    }

    public getAuthority(): string {
        if (this.initialTokenData) {
            return `https://login.microsoftonline.com/${this.initialTokenData.tenantId}`;
        }
        return null;
    }

    public getScopes(): string[] {
        if (this.initialTokenData) {
            return [this.initialTokenData.scope];
        }
        return ["https://management.azure.com/user_impersonation"];
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

    public updateToken(token: string): void {
        const accessToken = AccessToken.parse(token);
        if (accessToken) {
            sessionStorage.setItem(ARM_TOKEN, accessToken.toString());
        }
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
        this.initialTokenData = null;
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return false;
        }

        return !accessToken.isExpired();
    }
}