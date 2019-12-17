import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";
import { pageUrlHome, hashSignOut } from "../constants";

export class SignOutRouteGuard implements RouteGuard {

    constructor(private readonly authenticator: IAuthenticator) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash === hashSignOut) {
            await this.authenticator.clearAccessToken();
            location.assign(pageUrlHome);
        }
        return true;
    }
}