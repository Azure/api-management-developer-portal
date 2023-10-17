import * as msal from "@azure/msal-browser";
import * as Constants from "../constants";
import { HttpClient } from "@paperbits/common/http";
import { RouteGuard, Route } from "@paperbits/common/routing";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { IAuthenticator } from "../authentication";
import { AadB2CClientConfig } from "../contracts/aadB2CClientConfig";


/**
 * AAD/B2C sign-out route guard ensures that AAD/B2C session gets terminated when website user signs out.
 */
export class AadSignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly settingsProvider: ISettingsProvider,
        private readonly httpClient: HttpClient
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }

        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(Constants.SettingNames.aadB2CClientConfig);

        if (!config) {
            return true;
        }

        const auth = `https://${config.authority}/tfp/${config.signinTenant}/${config.signinPolicyName}`;

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
        msalInstance.logoutPopup({
            postLogoutRedirectUri: location.origin + "/",
            mainWindowRedirectUri: location.origin + "/"
        }); // actual sign-out from AAD/B2C

        return false; // explicitly stopping route execution.
    }
}