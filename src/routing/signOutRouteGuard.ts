import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";
import { hashSignOut } from "../constants";
import { MapiClient } from "../services/mapiClient";
import { Identity } from "../contracts/identity";
import { TenantService } from "../services/tenantService";
import { BackendService } from "../services/backendService";
import { DelegationAction } from "../contracts/tenantSettings";

export class SignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly authenticator: IAuthenticator,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== hashSignOut) {
            return true;
        }

        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();

        if (isDelegationEnabled) {
            const token = await this.authenticator.getAccessToken();

            if (token) {
                try {
                    const identity = await this.mapiClient.get<Identity>("/identity");

                    if (identity) {
                        const redirectUrl = await this.backendService.getDelegationUrl(DelegationAction.signOut, { userId: identity.id });
                        if (redirectUrl) {
                            window.open(redirectUrl, "_self");
                        }
                    }
                }
                catch (error) {
                    const errorMessage: string = error.message;
                    const requestedUrl: string = error.requestedUrl;
                    if (errorMessage.startsWith("Could not complete the request.") && requestedUrl.endsWith("/delegation-url")) {
                        alert("Delegation CORS error: self-hosted portal and Dev portal must have the same domain");
                    }
                    return true;
                }
            }
        }

        this.authenticator.clearAccessToken();
        location.assign("/");
    }
}