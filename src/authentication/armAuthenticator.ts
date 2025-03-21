import * as Msal from "@azure/msal-browser";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";
import { IAuthenticator, AccessToken } from ".";
import { SettingNames } from "../constants";


// const aadClientId = "a962e1ed-5694-4abe-9e9b-d08d35877efc"; // test app PROD
// const aadClientId = "4c6edb5e-d0fb-4ca1-ac29-8c181c1a9522"; // test app PPE

// const authority = "https://login.microsoftonline.com/common"; // PROD
// const authority = "https://login.windows-ppe.net/common"; // PPE

// const redirectUri = "https://apimanagement-cors-proxy-df.azure-api.net/portal/signin-aad";

// login example
// http://localhost:8080?subscriptionId=b8ff56dc-3bc7-4174-a1e8-3726ab15d0e2&resourceGroupName=Admin-ResourceGroup&serviceName=igo-east

export class ArmAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;
    private loginRequest: Msal.SilentRequest;
    private msalInstance: Msal.PublicClientApplication;
    private authPromise: Promise<AccessToken>;

    private initializePromise: Promise<void>;

    constructor(
        private readonly settingsProvider: ISettingsProvider
    ) {}

    private async ensureInitialized(): Promise<void> {
        if (!this.initializePromise) {
            this.initializePromise = this.initInstance();
        }
        return this.initializePromise;
    }

    private async initInstance(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();
        const aadClientId = settings[SettingNames.aadClientId];
        const authority = settings[SettingNames.aadAuthority];
        this.loginRequest = settings[SettingNames.aadLoginRequest];

        if (!aadClientId || !authority || !this.loginRequest) {
            throw new Error("Settings was not provided for Msal.Configuration");
        }

        const redirectUri = location.origin;

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
        await this.ensureInitialized();
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
        await this.ensureInitialized();
        const account = this.getAccount();

        if (!account) {
            const callbackResult = await this.checkCallbacks();

            if (callbackResult) {
                const parsedToken = AccessToken.parse(`${callbackResult.tokenType} ${callbackResult.accessToken}`);
                return parsedToken;
            }

            await this.msalInstance.acquireTokenRedirect(this.loginRequest);
            return;
        }

        this.loginRequest.account = account;

        try {
            const result = await this.msalInstance.acquireTokenSilent(this.loginRequest);
            const token = AccessToken.parse(`${result.tokenType} ${result.accessToken}`);

            return token;
        }
        catch (error) {
            if (error instanceof Msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalInstance.acquireTokenRedirect(this.loginRequest);
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