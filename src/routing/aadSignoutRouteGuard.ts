import * as Msal from "msal";
import * as Constants from "../constants";
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
        private readonly settingsProvider: ISettingsProvider
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }

        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(Constants.SettingNames.aadB2CClientConfig);

        if (!config) {
            return true;
        }

        const msalConfig = {
            auth: { clientId: config.clientId }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        const signedInUserAccount = msalInstance.getAccount();

        if (!signedInUserAccount) {
            return true; // if no AAD/B2C sessions open, allow router to continue the route change processing.
        }

        this.authenticator.clearAccessToken();
        msalInstance.logout();

        return false; // explicitly stopping route execution.
    }
}