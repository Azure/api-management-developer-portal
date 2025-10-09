import * as Msal from "@azure/msal-browser";
import { IAuthenticator, AccessToken } from ".";
import { AadLoginRequest } from "../constants";
import { IEditorSettings } from "./IEditorSettings";
import { Logger } from "@paperbits/common/logging";


const ARM_TOKEN = "armAccessToken";
const TOKEN_REFRESH_BEFORE = 15 * 60 * 1000; // 15 min before token expiration

export class ArmAuthenticator implements IAuthenticator {
    private msalInstance: Msal.PublicClientApplication;
    private authPromise: Promise<AccessToken>;
    private editorSettings: IEditorSettings;

    private readonly loginRequest: Msal.SilentRequest;

    constructor(private readonly logger: Logger) {
        this.loginRequest = { ...AadLoginRequest, forceRefresh: true };
        this.refreshToken = this.refreshToken.bind(this);
        this.getAccount = this.getAccount.bind(this);
        this.acquireToken = this.acquireToken.bind(this);
        setInterval(() => this.refreshToken(), 5 * 60 * 1000); // check token expiration every 5 min
    }

    public setEditorSettings(settings: IEditorSettings): void {
        this.editorSettings = settings;
    }

    public get armEndpoint() {
        return this.editorSettings.armEndpoint;
    }

    private async checkCallbacks(): Promise<Msal.AuthenticationResult> {
        try {
            return await this.msalInstance.handleRedirectPromise();
        }
        catch (error) {
            this.logger.trackError(error, { message: "Error on checkCallbacks." });
            return null;
        }
    }

    private async authenticate(): Promise<AccessToken> {
        const clientId = this.editorSettings.clientId;
        const tenantId = this.editorSettings.tenantId;

        if (!clientId) {
            throw new Error(`Settings "clientId" was not provided. It is required for MSAL configuration.`);
        }

        if (!tenantId) {
            throw new Error(`Settings "tenantId" was not provided. It is required for MSAL configuration.`);
        }

        if (this.editorSettings.scopes) {
            this.loginRequest.scopes = this.editorSettings.scopes;
        }

        const redirectUri = location.origin;

        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: clientId,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                redirectUri: redirectUri
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
            }
        };

        this.msalInstance = new Msal.PublicClientApplication(msalConfig);
        const result = await this.acquireToken();

        return result;
    }

    private async refreshToken(): Promise<void> {
        const current = await this.getAccessToken();

        if (current.expiresInMs() < TOKEN_REFRESH_BEFORE) {
            await this.acquireToken();
            this.logger.trackEvent("ArmAuthenticator", { message: "Token refreshed." });
        }
    }

    private async acquireToken(): Promise<AccessToken | null> {
        const account = await this.getAccount();

        let authenticationResult: Msal.AuthenticationResult;

        if (account) {
            authenticationResult = await this.acquireTokenSilent(account);
        }
        else {
            authenticationResult = await this.checkCallbacks();
        }

        if (!authenticationResult) {
            await this.msalInstance.acquireTokenRedirect(this.loginRequest);
        }

        const accessToken = AccessToken.parse(`${authenticationResult.tokenType} ${authenticationResult.accessToken}`);

        await this.setAccessToken(accessToken);

        return accessToken;
    }

    private async acquireTokenSilent(account: Msal.AccountInfo): Promise<Msal.AuthenticationResult> {
        try {
            this.msalInstance.setActiveAccount(account);
            const result = await this.msalInstance.acquireTokenSilent(this.loginRequest);

            return result;
        }
        catch (error) {
            this.logger.trackError(error, { message: "Error on acquireTokenSilent." });
            return null;
        }
    }

    private async getAccount(): Promise<Msal.AccountInfo> {
        if (!this.msalInstance) {
            await this.authenticate();
        }
        const accounts = this.msalInstance.getAllAccounts();

        if (accounts.length === 0) {
            return null;
        }

        return accounts[0];
    }

    public async getAccessToken(): Promise<AccessToken> {
        const accessTokenString = sessionStorage.getItem(ARM_TOKEN)

        if (accessTokenString) {
            const accessToken = AccessToken.parse(accessTokenString);

            if (!accessToken.isExpired()) {
                return accessToken;
            }
            else {
                this.clearAccessToken();
                alert("You session expired. Please sign-in again.");
            }
        }

        if (this.authPromise) {
            return this.authPromise;
        }

        this.authPromise = this.authenticate();
        return this.authPromise;
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
            this.logger.trackEvent("ArmAuthenticator", { message: "Cannot set expired access token." });
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