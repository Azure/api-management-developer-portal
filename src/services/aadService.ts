import * as Msal from "msal";
import * as AuthenticationContext from "adal-vanilla";
import * as Constants from "../constants";
import { IAuthenticator } from "../authentication";
import { Router } from "@paperbits/common/routing";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { RouteHelper } from "../routing/routeHelper";


/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadService {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) { }

    /**
     * Converts Azure Active Directory ID-token into MAPI Shared Access Signature.
     * @param idToken {string} ID token.
     * @param provider {string} Provider type, "Aad" or "AadB2C".
     */
    private async exchangeIdToken(idToken: string, provider: string): Promise<void> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.managementApiUrl);
        const managementApiVersion = await this.settingsProvider.getSetting<string>(Constants.SettingNames.managementApiVersion);

        const request = {
            url: `${managementApiUrl}/identity?api-version=${managementApiVersion}`,
            method: "GET",
            headers: [{ name: "Authorization", value: `${provider} id_token="${idToken}"` }]
        };

        const response = await this.httpClient.send(request);
        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (!sasTokenHeader) { // User not registered with APIM.
            const signupUrl = this.routeHelper.getIdTokenReferenceUrl(provider, idToken);
            await this.router.navigateTo(signupUrl);
            return;
        }

        const regex = /token=\"(.*==)\"/gm;
        const matches = regex.exec(sasTokenHeader.value);

        if (!matches || matches.length < 1) {
            throw new Error("Authentication failed. Unable to parse access token.");
        }

        const sasToken = matches[1];
        this.authenticator.setAccessToken(`SharedAccessSignature ${sasToken}`);
        await this.router.navigateTo(Constants.pageUrlHome);
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     * @param signinTenant {string} Azure Active Directory tenant used to signin.
     */
    public async signInWithAadMsal(aadClientId: string, signinTenant: string): Promise<void> {
        const auth = `https://${Constants.AadEndpoints.primary}/${signinTenant}`;

        const msalConfig = {
            auth: {
                clientId: aadClientId,
                authority: auth,
                validateAuthority: true
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        const loginRequest = {
            scopes: ["openid", "email", "profile"]
        };

        try {
            const response = await msalInstance.loginPopup(loginRequest);

            if (response.idToken && response.idToken.rawIdToken) {
                await this.exchangeIdToken(response.idToken.rawIdToken, Constants.IdentityProviders.aad);
            }
        }
        catch (error) {
            throw new Error(`Unable to obtain id_token with client ID: ${aadClientId}. Error: ${error.message}`);
        }
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     * @param signinTenant {string} Azure Active Directory tenant used to signin.
     */
    public signInWithAadAdal(aadClientId: string, signinTenant: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callback = async (errorDescription: string, idToken: string, error: string, tokenType: string) => {
                if (!idToken) {
                    reject(new Error(`Authentication failed.`));
                    console.error(`Unable to obtain id_token with client ID: ${aadClientId}. Error: ${error}. Details: ${errorDescription}.`);
                }

                try {
                    await this.exchangeIdToken(idToken, Constants.IdentityProviders.aad);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            };

            const authContextConfig = {
                tenant: signinTenant,
                clientId: aadClientId,
                popUp: true,
                callback: callback
            };

            const authContext = new AuthenticationContext(authContextConfig);
            authContext.login();
        });
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param clientId {string} Azure Active Directory B2C client ID.
     * @param authority {string} Tenant, e.g. "contoso.b2clogin.com".
     * @param instance {string} Instance, e.g. "contoso.onmicrosoft.com".
     * @param signInPolicy {string} Sign-in policy, e.g. "b2c_1_signinpolicy".
     */
    public async signInWithAadB2C(clientId: string, authority: string, instance: string, signInPolicy: string): Promise<void> {
        if (!clientId) {
            throw new Error(`Client ID not specified.`);
        }

        if (!authority) {
            throw new Error(`Authority not specified.`);
        }


        const auth = `https://${authority}/tfp/${instance}/${signInPolicy}`;

        const msalConfig = {
            auth: {
                clientId: clientId,
                authority: auth,
                validateAuthority: false
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);

        const loginRequest = {
            scopes: ["openid", "email", "profile"]
        };

        try {
            const response = await msalInstance.loginPopup(loginRequest);

            if (response.idToken && response.idToken.rawIdToken) {
                await this.exchangeIdToken(response.idToken.rawIdToken, Constants.IdentityProviders.aadB2C);
            }
        }
        catch (error) {
            throw new Error(`Unable to obtain id_token with client ID: ${clientId}. Error: ${error.message}`);
        }
    }

    /**
     * Ensures that all redirect-based callbacks are processed.
     */
    public async checkCallbacks(): Promise<void> {
        /**
         * There is a bug with signing-in through popup in MSAL library that
         * which results in opening original sign-in page in the same popup.
         */

        if (!window.opener) {
            return;
        }

        const msalConfig = {};
        const msalInstance = new Msal.UserAgentApplication(<any>msalConfig);
        await msalInstance.loginPopup({});

        window.close();
    }
}