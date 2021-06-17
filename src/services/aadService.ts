import * as Msal from "msal";
import * as AuthenticationContext from "adal-vanilla";
import * as Constants from "../constants";
import { Utils } from "../utils";
import { Router } from "@paperbits/common/routing";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { RouteHelper } from "../routing/routeHelper";
import { UsersService } from "./usersService";
import { AadB2CClientConfig } from "../contracts/aadB2CClientConfig";

/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadService {
    constructor(
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
        const credentials = `${provider} id_token="${idToken}"`;
        const userId = await this.usersService.authenticate(credentials);

        if (!userId) { // User not registered with APIM.
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

        const returnUrl = this.routeHelper.getQueryParameter("returnUrl") || Constants.pageUrlHome;

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

        const msalConfig: Msal.Configuration = {
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
    public signInWithAadAdal(aadClientId: string, instance: string, signinTenant: string, replyUrl?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callback = async (errorDescription: string, idToken: string, error: string) => {
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

            const authContextConfig: any = {
                tenant: signinTenant,
                instance: `https://${instance}/`,
                clientId: aadClientId,
                popUp: true,
                callback: callback
            };

            if (replyUrl) {
                authContextConfig.redirectUri = replyUrl;
            }

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
     * @param replyUrl {string} Reply URL, e.g. "/signin".
     */
    public async runAadB2CUserFlow(clientId: string, tenant: string, instance: string, userFlow: string, replyUrl?: string): Promise<void> {
        if (!clientId) {
            throw new Error(`Client ID not specified.`);
        }

        if (!tenant) {
            throw new Error(`Authority not specified.`);
        }

        const auth = `https://${tenant}/tfp/${instance}/${userFlow}`;

        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: clientId,
                authority: auth,
                validateAuthority: false,
            }
        };

        if (replyUrl) {
            msalConfig.auth.redirectUri = replyUrl;
        }

        const msalInstance = new Msal.UserAgentApplication(msalConfig);

        const loginRequest = {
            scopes: ["openid", "email", "profile"]
        };

        const response = await msalInstance.loginPopup(loginRequest);

        if (response.idToken && response.idToken.rawIdToken) {
            await this.exchangeIdToken(response.idToken.rawIdToken, Constants.IdentityProviders.aadB2C);
        }
    }

    public async signOutAadB2C(): Promise<void> {
        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(Constants.SettingNames.aadClientConfig);

        const msalConfig: Msal.Configuration = {
            auth: {
                clientId: config.clientId,
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        msalInstance.logout();
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