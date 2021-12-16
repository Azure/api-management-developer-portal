import * as Msal from "@azure/msal-browser";
import { IAuthenticator, AccessToken } from ".";


const aadClientId = "a962e1ed-5694-4abe-9e9b-d08d35877efc"; // test app
const loginRequest = { scopes: ["openid", "profile", "https://management.azure.com/user_impersonation"], account: null };
const authority = "https://login.microsoftonline.com/common";
const redirectUri = "https://apimanagement-cors-proxy-df.azure-api.net/portal/signin-aad";

export class ArmAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;
    private msalInstance: Msal.PublicClientApplication;
    private authPromise: Promise<AccessToken>;

    constructor() {
        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: aadClientId,
                authority: authority,
                redirectUri: redirectUri
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            }
        };

        this.msalInstance = new Msal.PublicClientApplication(msalConfig);
    }

    public async checkCallbacks(): Promise<Msal.AuthenticationResult> {
        try {

            return await this.msalInstance.handleRedirectPromise();
        }
        catch (error) {
            console.error(error);
        }
    }

    private getAccount(): Msal.AccountInfo {
        const accounts = this.msalInstance.getAllAccounts();

        if (accounts.length === 0) {
            return null;
        }

        return accounts[0];
    }

    private async tryAcquireToken(): Promise<AccessToken> {
        const account = this.getAccount();

        if (!account) {
            const callbackResult = await this.checkCallbacks();

            if (callbackResult) {
                const parsedToken = AccessToken.parse(`${callbackResult.tokenType} ${callbackResult.accessToken}`);
                return parsedToken;
            }

            await this.msalInstance.acquireTokenRedirect(loginRequest);
            return;
        }

        loginRequest.account = account;

        try {
            const result = await this.msalInstance.acquireTokenSilent(loginRequest);
            const token = AccessToken.parse(`${result.tokenType} ${result.accessToken}`);

            return token;
        }
        catch (error) {
            if (error instanceof Msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalInstance.acquireTokenRedirect(loginRequest);
            }
            else {
                console.warn(error);
            }
        }

        return null;
    }

    private async startGettingToken(): Promise<AccessToken> {
        const accessToken = await this.tryAcquireToken();
        return accessToken;
    }

    public getAccessToken(): Promise<AccessToken> {
        if (this.authPromise) {
            return this.authPromise;
        }

        this.authPromise = this.startGettingToken();
        return this.authPromise;
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

        this.accessToken = accessToken;
        sessionStorage.setItem("armAccessToken", accessToken.toString());
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem("accessToken");
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return false;
        }

        return !accessToken.isExpired();
    }
}