import * as AuthenticationContext from "adal-vanilla";
import { IAuthenticator } from "../authentication";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";


/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadService {
    private authContext: AuthenticationContext;

    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    /**
     * Converts Azure Active Directory ID-token into MAPI Shared Access Signature.
     * @param idToken {string} ID token.
     */
    private async exchangeIdToken(idToken: string): Promise<void> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>("managementApiUrl");
        const managementApiVersion = await this.settingsProvider.getSetting<string>("managementApiVersion");

        const request = {
            url: `${managementApiUrl}/identity?api-version=${managementApiVersion}`,
            method: "GET",
            headers: [{ name: "Authorization", value: `AAD id_token="${idToken}"` }]
        };

        const response = await this.httpClient.send(request);
        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");

        if (!sasTokenHeader) {
            throw new Error(`Authentication failed.`);
        }

        const regex = /token=\"(.*==)\"/gm;
        const matches = regex.exec(sasTokenHeader.value);

        if (matches && matches.length > 1) {
            const sasToken = matches[1];
            this.authenticator.setAccessToken(`SharedAccessSignature ${sasToken}`);
        }
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     */
    public signIn(aadClientId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callback = async (errorDescription: string, idToken: string, error: string, tokenType: string) => {
                if (!idToken) {
                    reject(new Error(`Authentication failed.`));
                    console.error(`Unable to obtain id_token with client ID: ${aadClientId}. Error: ${error}. Details: ${errorDescription}.`);
                }

                try {
                    await this.exchangeIdToken(idToken);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            };

            if (!this.authContext) {
                const authContextConfig = {
                    clientId: aadClientId,
                    popUp: true,
                    callback: callback
                };

                this.authContext = new AuthenticationContext(authContextConfig);
            }

            this.authContext.login();
        });
    }

    /**
     * Initiates signing out from Azure Active Directory session.
     */
    public signOut(): Promise<void> {
        if (!this.authContext) {
            return;
        }

        this.authContext.logout();
    }
}