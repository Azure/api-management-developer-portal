import * as Msal from "msal";
import { IAuthenticator } from "../authentication";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";


/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadService {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Converts Azure Active Directory ID-token into MAPI Shared Access Signature.
     * @param idToken {string} ID token.
     * @param type {string} Service type, "AAD" or "AADB2C".
     */
    private async exchangeIdToken(idToken: string, type: string): Promise<void> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        const managementApiVersion = await this.settingsProvider.getSetting<string>("managementApiVersion");

        const request = {
            url: `${managementApiUrl}/identity?api-version=${managementApiVersion}`,
            method: "GET",
            headers: [{ name: "Authorization", value: `${type} id_token="${idToken}"` }]
        };

        const response = await this.httpClient.send(request);
        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (!sasTokenHeader) {
            throw new Error(`Authentication failed. Header with access token is missing.`);
        }

        const regex = /token=\"(.*==)\"/gm;
        const matches = regex.exec(sasTokenHeader.value);

        if (!matches || matches.length < 1) {
            throw new Error("Authentication failed. Unable to parse access token.");
        }

        const sasToken = matches[1];
        this.authenticator.setAccessToken(`SharedAccessSignature ${sasToken}`);
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     */
    public async signInWithAad(aadClientId: string): Promise<void> {
        const msalConfig = {
            auth: {
                clientId: aadClientId
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        const loginRequest = {};

        try {
            const response = await msalInstance.loginPopup(loginRequest);

            if (response.idToken && response.idToken.rawIdToken) {
                await this.exchangeIdToken(response.idToken.rawIdToken, "AAD");
            }
        }
        catch (error) {
            console.error(`Unable to obtain id_token with client ID: ${aadClientId}. Error: ${error}.`);
        }
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

        const loginRequest = {};

        try {
            const response = await msalInstance.loginPopup(loginRequest);

            if (response.idToken && response.idToken.rawIdToken) {
                await this.exchangeIdToken(response.idToken.rawIdToken, "AADB2C");
            }
        }
        catch (error) {
            throw new Error(`Unable to obtain id_token with client ID: ${clientId}. Error: ${error}.`);
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