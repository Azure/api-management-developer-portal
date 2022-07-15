import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";
import * as Constants from "../constants";
import { MapiClient } from "../services/mapiClient";
import { Identity } from "../contracts/identity";
import { TenantService } from "../services/tenantService";
import { BackendService } from "../services/backendService";
import { DelegationAction, DelegationParameters } from "../contracts/tenantSettings";
import { clear } from "idb-keyval";

export class SignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly mapiClient: MapiClient,
        private readonly authenticator: IAuthenticator,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }

        const isSignOutAfterClose = sessionStorage.getItem(Constants.closeAccount);

        if (isSignOutAfterClose !== "true") {
            const isDelegationEnabled = await this.tenantService.isDelegationEnabled();

            if (isDelegationEnabled) {
                const token = await this.authenticator.getAccessTokenAsString();

                if (token) {
                    try {
                        const identity = await this.mapiClient.get<Identity>("/identity", [await this.mapiClient.getPortalHeader("delegationSignOut")]);

                        if (identity) {
                            const delegationParam = {};
                            delegationParam[DelegationParameters.UserId] =  identity.id;
                            const redirectUrl = await this.backendService.getDelegationString(DelegationAction.signOut, delegationParam);
                            if (redirectUrl) {
                                this.authenticator.clearAccessToken();
                                await clear(); // clear cache in indexedDB
                                location.assign(redirectUrl);
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
        } else {
            sessionStorage.removeItem(Constants.closeAccount);
        }

        this.authenticator.clearAccessToken();
        await clear(); // clear cache in indexedDB
        location.assign(Constants.pageUrlHome);
    }
}