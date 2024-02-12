import * as msal from "@azure/msal-browser";
import * as Constants from "../constants";
import { HttpClient } from "@paperbits/common/http";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../routing/routeHelper";
import { Utils } from "../utils";
import { UsersService } from "./usersService";
import { IAadService } from "./IAadService";
import { Logger } from "@paperbits/common/logging";
import { eventTypes } from "../logging/clientLogger";

/**
 * Service for operations with Azure Active Directory identity provider.
 */
export class AadServiceV2 implements IAadService {
    constructor(
        private readonly router: Router,
        private readonly routeHelper: RouteHelper,
        private readonly usersService: UsersService,
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) { }

    /**
     * Converts Azure Active Directory ID-token into MAPI Shared Access Signature.
     * @param {string} idToken - ID token.
     * @param {string} provider - Provider type, `Aad` or `AadB2C`.
     */
    private async exchangeIdToken(idToken: string, provider: string, calledFrom: eventTypes): Promise<void> {
        const credentials = `${provider} id_token="${idToken}"`;
        const userId = await this.usersService.authenticate(credentials);

        if (!userId) { // User not registered with APIM.
            this.logger.trackEvent(calledFrom, { message: "User not registered with APIM. Starting signup flow." });
            const jwtToken = Utils.parseJwt(idToken);
            const firstName = jwtToken.given_name;
            const lastName = jwtToken.family_name;
            const email = jwtToken.email || jwtToken.emails?.[0];

            if (firstName && lastName && email) {
                await this.usersService.createUserWithOAuth(provider, idToken, firstName, lastName, email);
            }
            else {
                this.logger.trackEvent(calledFrom, { message: "User data not found in ID token. Navigating to signup URL." });
                const signupUrl = this.routeHelper.getIdTokenReferenceUrl(provider, idToken);
                await this.router.navigateTo(signupUrl);
                return;
            }
        }

        const hash = this.router.getHash()
        let returnUrl = this.routeHelper.getQueryParameter("returnUrl") || Constants.pageUrlHome;

        if (hash) { // special case for server-side redirect when hash part of URL gets discarded
            returnUrl += `#${hash}`;
        }

        this.router.getCurrentUrl() === returnUrl
            ? location.reload()
            : await this.router.navigateTo(Utils.sanitizeReturnUrl(returnUrl));
    }

    /**
     * Initiates signing-in with Azure Active Directory identity provider.
     * @param {string} clientId - Azure Active Directory client ID.
     * @param {string} authority - Tenant, e.g. `contoso.b2clogin.com`.
     * @param {string} signinTenant - Azure Active Directory tenant used to signin, e.g. `contoso.onmicrosoft.com`.
     * @param {string} replyUrl - Reply URL, e.g. `https://contoso.com/signin-aad`.
     */
    public async signInWithAad(clientId: string, authority: string, signinTenant: string, replyUrl?: string): Promise<void> {
        console.log("Msal v2");
        if (!clientId) {
            throw new Error(`Parameter "clientId" not specified.`);
        }

        if (!authority) {
            throw new Error(`Parameter "authority" not specified.`);
        }

        if (!signinTenant) {
            throw new Error(`Parameter "signinTenant" not specified.`);
        }

        const authorityUrl = `https://${authority}/${signinTenant}`;
        const metadataResponse = await this.httpClient.send({ url: `${authorityUrl}/.well-known/openid-configuration` });
        const metadata = metadataResponse.toText();

        const msalConfig: msal.Configuration = {
            auth: {
                clientId: clientId,
                authority: authorityUrl,
                authorityMetadata: metadata,
                knownAuthorities: [authority]
            }
        };

        if (replyUrl) {
            msalConfig.auth.redirectUri = replyUrl;
        }

        const msalInstance = new msal.PublicClientApplication(msalConfig);

        const loginRequest = {
            scopes: ["openid"]
        };

        const response = await msalInstance.loginPopup(loginRequest);

        if (response.idToken) {
            await this.exchangeIdToken(response.idToken, Constants.IdentityProviders.aad, eventTypes.aadLogin);
            this.logger.trackEvent(eventTypes.aadLogin, { message: "Login successful." });
        }
    }

    /**
     * Runc Azure Active Directory B2C user flow.
     * @param {string} clientId - Azure Active Directory B2C client ID.
     * @param {string} tenant - Tenant, e.g. `contoso.b2clogin.com`.
     * @param {string} instance - Instance, e.g. `contoso.onmicrosoft.com`.
     * @param {string} userFlow - User flow, e.g. `B2C_1_signinsignup`.
     * @param {string} replyUrl - Reply URL, e.g. `https://contoso.com/signin`.
     */
    public async runAadB2CUserFlow(clientId: string, tenant: string, instance: string, userFlow: string, replyUrl?: string): Promise<void> {
        console.log("Msal v2");
        if (!clientId) {
            throw new Error(`Parameter "clientId" not specified.`);
        }

        if (!tenant) {
            throw new Error(`Parameter "tenant" not specified.`);
        }

        if (!instance) {
            throw new Error(`Parameter "instance" not specified.`);
        }

        if (!userFlow) {
            throw new Error(`Parameter "userFlow" not specified.`);
        }

        const auth = `https://${tenant}/tfp/${instance}/${userFlow}`;

        const msalConfig: msal.Configuration = {
            auth: {
                clientId: clientId,
                authority: auth,
                knownAuthorities: [tenant]
            }
        };

        if (replyUrl) {
            msalConfig.auth.redirectUri = replyUrl;
        }

        const msalInstance = new msal.PublicClientApplication(msalConfig);

        const loginRequest = {
            scopes: ["openid", "email", "profile"]
        };

        const response = await msalInstance.loginPopup(loginRequest);

        if (response.idToken) {
            await this.exchangeIdToken(response.idToken, Constants.IdentityProviders.aadB2C, eventTypes.aadB2CLogin);
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "Login successful." });
        }
        else {
            this.logger.trackEvent(eventTypes.aadB2CLogin, { message: "AadB2C Login failed: ID token not found in response." });
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
        const msalInstance = new msal.PublicClientApplication(<any>msalConfig);
        await msalInstance.loginPopup();

        window.close();
    }
}