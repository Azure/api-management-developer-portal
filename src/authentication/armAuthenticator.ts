import * as Msal from "msal";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from ".";


const aadClientId = "bece2c2c-99d7-4c1b-91a4-1acf323eae0e"; // test app
const scopes = ["https://management.azure.com/user_impersonation"];

export class ArmAuthenticator implements IAuthenticator {
    private accessToken: AccessToken;
    private msalInstance: Msal.UserAgentApplication;

    constructor() {
        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: aadClientId,
            }
        };

        this.msalInstance = new Msal.UserAgentApplication(msalConfig);
    }

    private async tryAcquireToken(): Promise<AccessToken> {
        let response: Msal.AuthResponse;
        const loginRequest: Msal.AuthenticationParameters = { scopes: scopes };

        if (this.msalInstance.getAccount()) {
            response = await this.msalInstance.acquireTokenSilent(loginRequest);
        }
        else {
            response = await this.msalInstance.loginPopup(loginRequest);
        }

        await Utils.delay(1);

        if (!response.accessToken) {
            throw new Error(`Unable to acquire ARM token.`);
        }

        const accessToken = AccessToken.parse(`Bearer ${response.accessToken}`);
        this.setAccessToken(accessToken);

        setTimeout(this.tryAcquireToken.bind(this), 30 * 60 * 1000);  // scheduling token refresh in 30 min

        return accessToken;
    }

    public async getAccessToken(): Promise<string> {
        if (this.accessToken && !this.accessToken.isExpired()) {
            return this.accessToken.toString();
        }

        const storedAccessToken = sessionStorage.getItem("armAccessToken");

        if (storedAccessToken) {
            const parsedToken = AccessToken.parse(storedAccessToken);

            if (!parsedToken.isExpired()) {
                return parsedToken.toString();
            }
        }

        const accessToken = await this.tryAcquireToken();
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

        const parsedToken = AccessToken.parse(accessToken);

        if (!parsedToken) {
            return false;
        }

        return !parsedToken.isExpired();
    }
}