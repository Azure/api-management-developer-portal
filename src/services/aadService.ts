import * as Msal from "msal";
import * as AuthenticationContext from "adal-vanilla";
import * as Constants from "../constants";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from "../authentication";
import { Router } from "@paperbits/common/routing";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { RouteHelper } from "../routing/routeHelper";
import { UsersService } from "./usersService";
import { MapiClient } from "./mapiClient";

/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadService {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly usersService: UsersService
    ) { }

    /**
     * Converts Azure Active Directory ID-token into MAPI Shared Access Signature.
     * @param idToken {string} ID token.
     * @param provider {string} Provider type, "Aad" or "AadB2C".
     */
    private async exchangeIdToken(idToken: string, provider: string): Promise<void> {
        let managementApiUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.managementApiUrl);
        managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);

        const request = {
            url: `${managementApiUrl}/identity?api-version=${Constants.managementApiVersion}`,
            method: "GET",
            headers: [
                { name: "Authorization", value: `${provider} id_token="${idToken}"` }, 
                MapiClient.getPortalHeader()
            ]
        };

        const response = await this.httpClient.send(request);
        const sasTokenHeader = response.headers.find(x => x.name.toLowerCase() === "ocp-apim-sas-token");
        const returnUrl = this.routeHelper.getQueryParameter("returnUrl") || Constants.pageUrlHome;

        if (sasTokenHeader) {
            const accessToken = AccessToken.parse(sasTokenHeader.value);
            await this.authenticator.setAccessToken(accessToken);
        }
        else { // User not registered with APIM.
            const jwtToken = Utils.parseJwt(idToken);
            const firstName = jwtToken.given_name;
            const lastName = jwtToken.family_name;
            const email = jwtToken.email || jwtToken.emails?.[0];

            if (firstName && lastName && email) {
                await this.usersService.createUserWithOAuth(provider, idToken, firstName, lastName, email);
            }
            else {
                const signupUrl = this.routeHelper.getIdTokenReferenceUrl(provider, idToken);
                await this.router.navigateTo(signupUrl);
                return;
            }
        }

        this.router.getCurrentUrl() === returnUrl
            ? location.reload()
            : await this.router.navigateTo(returnUrl);
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     * @param signinTenant {string} Azure Active Directory tenant used to signin.
     */
    public async signInWithAadMsal(aadClientId: string, authority: string, signinTenant: string): Promise<void> {
        const authorityUrl = `https://${authority}/${signinTenant}`;

        const msalConfig = {
            auth: {
                clientId: aadClientId,
                authority: authorityUrl,
                validateAuthority: true
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        const loginRequest = {
            scopes: ["openid", "email", "profile"]
        };

        const response = await msalInstance.loginPopup(loginRequest);

        if (response.idToken && response.idToken.rawIdToken) {
            await this.exchangeIdToken(response.idToken.rawIdToken, Constants.IdentityProviders.aad);
        }
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param aadClientId {string} Azure Active Directory client ID.
     * @param signinTenant {string} Azure Active Directory tenant used to signin.
     */
    public signInWithAadAdal(aadClientId: string, instance: string, signinTenant: string): Promise<void> {
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
                instance: `https://${instance}/`,
                clientId: aadClientId,
                popUp: true,
                callback: callback
            };

            const authContext = new AuthenticationContext(authContextConfig);
            authContext.login();
        });
    }

    /**
     * Runc Azure Active Directory B2C user flow.
     * @param clientId {string} Azure Active Directory B2C client ID.
     * @param tenant {string} Tenant, e.g. "contoso.b2clogin.com".
     * @param instance {string} Instance, e.g. "contoso.onmicrosoft.com".
     * @param userFlow {string} User flow, e.g. "B2C_1_signinsignup".
     */
    public async runAadB2CUserFlow(clientId: string, tenant: string, instance: string, userFlow: string): Promise<void> {
        if (!clientId) {
            throw new Error(`Client ID not specified.`);
        }

        if (!tenant) {
            throw new Error(`Authority not specified.`);
        }

        const auth = `https://${tenant}/tfp/${instance}/${userFlow}`;

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

        const response = await msalInstance.loginPopup(loginRequest);

        if (response.idToken && response.idToken.rawIdToken) {
            await this.exchangeIdToken(response.idToken.rawIdToken, Constants.IdentityProviders.aadB2C);
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