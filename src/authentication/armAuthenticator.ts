import * as Msal from "@azure/msal-browser";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from ".";


const aadClientId = "a962e1ed-5694-4abe-9e9b-d08d35877efc"; // test app
const scopes = ["https://management.azure.com/user_impersonation"];
const loginRequest = { scopes: ["openid", "profile", "https://management.azure.com/user_impersonation"] };


export class ArmAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;
    private msalInstance: Msal.PublicClientApplication;

    constructor() {
        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: aadClientId,
                authority: "https://login.microsoftonline.com/common",
                redirectUri: "https://apimanagement-cors-proxy-df.azure-api.net/portal/signin-aad",
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            }
        };

        this.msalInstance = new Msal.PublicClientApplication(msalConfig);
        this.checkCallbacks();
    }

    public async checkCallbacks(): Promise<void> {
        try {
            const response = await this.msalInstance.handleRedirectPromise();

            debugger;

            if (response !== null) {
                // sessionStorage[tokenKey] = response.idToken;
                // this.onLogin.next(true);

                // this.checkToken();
            }
        }
        catch (error) {
            console.error(error);
        }
    }



    private async getTokenRedirect(request): Promise<Msal.AuthenticationResult> {
        const account = this.getAccount();

        if (!account) {
            await this.msalInstance.acquireTokenRedirect(request);
            return;
        }

        request.account = account;

        try {
            return await this.msalInstance.acquireTokenSilent(request);
        }
        catch (error) {
            console.warn("silent token acquisition fails. acquiring token using redirect");

            if (error instanceof Msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalInstance.acquireTokenRedirect(request);
            }
            else {
                console.warn(error);
            }
        }
    }

    private getAccount(): Msal.AccountInfo {
        const accounts = this.msalInstance.getAllAccounts();

        if (accounts.length === 0) {
            return null;
        }

        return accounts[0];
    }

    private async tryAcquireToken(request: any): Promise<any> {
        const account = this.getAccount();

        if (!account) {
            await this.msalInstance.acquireTokenRedirect(request);
            return;
        }

        request.account = account;

        try {
            const result = await this.msalInstance.acquireTokenSilent(request);
            debugger;
        }
        catch (error) {
            console.warn("silent token acquisition fails. acquiring token using redirect");

            if (error instanceof Msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalInstance.acquireTokenRedirect(request);
            }
            else {
                console.warn(error);
            }
        }


        console.log("2");
        // await Utils.delay(1);

        // if (!response.accessToken) {
        //     throw new Error(`Unable to acquire ARM token.`);
        // }

        // const accessToken = AccessToken.parse(`Bearer ${response.accessToken}`);
        // this.setAccessToken(accessToken);



        // setTimeout(this.tryAcquireToken.bind(this), 30 * 60 * 1000);  // scheduling token refresh in 30 min

        // return accessToken;


        return null;
    }

    public async getAccessToken(): Promise<AccessToken> {
        if (this.accessToken && !this.accessToken.isExpired()) {
            return this.accessToken;
        }

        const storedAccessToken = sessionStorage.getItem("armAccessToken");

        if (storedAccessToken) {
            const parsedToken = AccessToken.parse(storedAccessToken);

            if (!parsedToken.isExpired()) {
                return parsedToken;
            }
        }

        const accessToken = await this.tryAcquireToken(loginRequest);
        return accessToken;
    }

    public async getAccessTokenAsString(): Promise<string> {
        const accessToken = await this.getAccessToken();
        return accessToken.toString();
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