import * as msal from "@azure/msal-browser";
import * as Constants from "../constants";
import { HttpClient } from "@paperbits/common/http";
import { RouteGuard, Route } from "@paperbits/common/routing";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { IAuthenticator } from "../authentication";
import { AadB2CClientConfig } from "../contracts/aadB2CClientConfig";
import { Logger } from "@paperbits/common/logging";
import { eventTypes } from "../logging/clientLogger";
import { AadServiceV2 } from "../services/aadServiceV2";


/**
 * AAD/B2C sign-out route guard ensures that AAD/B2C session gets terminated when website user signs out.
 */
export class AadSignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly settingsProvider: ISettingsProvider,
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }

        const loginClientConfigType = sessionStorage.getItem(Constants.loginClientConfigType);
        if(!loginClientConfigType) {
            return true; // if no AAD/B2C sessions open, allow router to continue the route change processing.
        }

        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(loginClientConfigType);

        if (!config) {
            return true;
        }

        const auth = AadServiceV2.getAuthorityUrl(loginClientConfigType, config.authority, config.signinTenant, config.signinPolicyName);

        const msalConfig = {
            auth: {
                clientId: config.clientId,
                authority: auth,
                knownAuthorities: [config.authority],
                postLogoutRedirectUri: location.origin
            }
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);
        const currentAccounts = msalInstance.getAllAccounts();
        const signedInUserAccount = currentAccounts?.length > 0 && currentAccounts[0];

        if (!signedInUserAccount) {
            return true; // if no AAD/B2C sessions open, allow router to continue the route change processing.
        }

        await this.httpClient.send({ url: "/signout" }); // server session termination.

        this.authenticator.clearAccessToken();
        sessionStorage.removeItem(Constants.loginClientConfigType);
        const eventType = loginClientConfigType === Constants.SettingNames.aadB2CClientConfig ? eventTypes.aadB2CLogin : eventTypes.aadLogin;
        msalInstance.setActiveAccount(signedInUserAccount);
        const response = await msalInstance.acquireTokenSilent({scopes: ["openid"]});

        msalInstance.logoutPopup({
            idTokenHint: response?.idToken,
            postLogoutRedirectUri: location.origin + "/",
            mainWindowRedirectUri: location.origin + "/"
        }).catch((error) => {
            this.logger.trackEvent(eventType, { message: `Sign out failed. ${error?.message}.` });
        }); // actual sign-out from AAD/B2C

        return false; // explicitly stopping route execution.
    }
}