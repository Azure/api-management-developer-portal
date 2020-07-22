import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";
import { hashSignOut } from "../constants";
import { MapiClient } from "../services/mapiClient";
import { Identity } from "../contracts/identity";

export class SignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly authenticator: IAuthenticator
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== hashSignOut) {
            return true;
        }

        const token = await this.authenticator.getAccessToken();
        let userId = "";

        if (token) {
            try {
                const identity = await this.mapiClient.get<Identity>("/identity");

                if (identity) {
                    userId = `?userId=${identity.id}`;
                }
            }
            catch (error) {
                return true;
            }
        }

        this.authenticator.clearAccessToken();
        location.assign("/signout" + userId);
    }
}