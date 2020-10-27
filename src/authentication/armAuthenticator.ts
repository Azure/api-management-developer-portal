import * as Msal from "msal";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from ".";
import { HttpHeader } from "@paperbits/common/http/httpHeader";


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
            return this.accessToken.value;
        }

        const storedAccessToken = sessionStorage.getItem("accessToken");

        if (storedAccessToken) {
            const parsedToken = AccessToken.parse(storedAccessToken);

            if (!parsedToken.isExpired()) {
                return parsedToken.value;
            }
        }

        const accessToken = await this.tryAcquireToken();
        return accessToken.value;
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        if (accessToken.isExpired()) {
            console.warn(`Cannot set expired access token.`);
            return;
        }

        this.accessToken = accessToken;
        sessionStorage.setItem("accessToken", accessToken.toString());
    }

    public async refreshAccessTokenFromHeader(responseHeaders: HttpHeader[] = []): Promise<string> {
        const accessTokenHeader = responseHeaders.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (accessTokenHeader?.value) {
            const accessToken = AccessToken.parse(accessTokenHeader.value);
            const accessTokenString = accessToken.toString();

            const current = sessionStorage.getItem("accessToken");

            if (current !== accessTokenString) {
                sessionStorage.setItem("accessToken", accessTokenString);
                return accessTokenString;
            }
        }

        return undefined;
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