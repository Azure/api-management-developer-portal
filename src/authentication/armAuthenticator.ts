import * as Msal from "msal";
import { HttpClient } from "@paperbits/common/http";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from ".";
import { HttpHeader } from "@paperbits/common/http/httpHeader";


const aadClientId = "bece2c2c-99d7-4c1b-91a4-1acf323eae0e"; // test app
const scopes = ["https://management.azure.com/user_impersonation"];

export class ArmAuthenticator implements IAuthenticator {
    private msalInstance: Msal.UserAgentApplication;

    private loginRequest: Msal.AuthenticationParameters = {
        scopes: scopes
    };

    private renewIdTokenRequest: Msal.AuthenticationParameters = {
        scopes: scopes
    };

    constructor(private readonly httpClient: HttpClient) {
        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: aadClientId,
            }
        };

        this.msalInstance = new Msal.UserAgentApplication(msalConfig);
    }

    public async getAccessToken(): Promise<string> {
        if (sessionStorage["token"]) {
            return sessionStorage["token"];
        }

        // TODO: Check expiration and do acquireTokenSilent.

        let response: Msal.AuthResponse;

        if (this.msalInstance.getAccount()) {
            response = await this.msalInstance.acquireTokenSilent(this.renewIdTokenRequest);
        }
        else {
            response = await this.msalInstance.loginPopup(this.loginRequest);
        }

        await Utils.delay(1);

        if (response.accessToken) {
            const token = `Bearer ${response.accessToken}`;

            sessionStorage["token"] = token;
            return token;
        }
    }

    public async setAccessToken(accessToken: AccessToken): Promise<void> {
        if (accessToken.isExpired()) {
            console.warn(`Cannot set expired access token.`);
            return;
        }

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