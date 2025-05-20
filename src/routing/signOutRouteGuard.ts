import { RouteGuard, Route } from "@paperbits/common/routing";
import { Logger } from "@paperbits/common/logging";
import { IAuthenticator } from "../authentication";
import * as Constants from "../constants";
import { IApiClient } from "../clients";
import { Identity } from "../contracts/identity";
import { DelegationAction, DelegationParameters } from "../contracts/tenantSettings";
import { clear } from "idb-keyval";
import { IDelegationService } from "../services/IDelegationService";

export class SignOutRouteGuard implements RouteGuard {
    constructor(
        private readonly apiClient: IApiClient,
        private readonly authenticator: IAuthenticator,
        private readonly delegationService: IDelegationService,
        private readonly logger: Logger
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }

        const isSignOutAfterClose = sessionStorage.getItem(Constants.closeAccount);

        if (isSignOutAfterClose !== "true") {
            const isDelegationEnabled = await this.delegationService.isUserRegistrationDelegationEnabled();

            if (isDelegationEnabled) {
                const token = await this.authenticator.getAccessTokenAsString();

                if (token) {
                    try {
                        const identity = await this.apiClient.get<Identity>("/identity", [await this.apiClient.getPortalHeader("delegationSignOut")]);

                        if (identity) {
                            const delegationParam = {};
                            delegationParam[DelegationParameters.UserId] = identity.id;
                            const redirectUrl = await this.delegationService.getUserDelegationUrl(identity.id, DelegationAction.signOut, delegationParam);
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
                        await this.logger.trackError(error);
                        if (errorMessage.startsWith("Could not complete the request.") && requestedUrl.endsWith("/delegation-url")) {
                            alert("Delegation CORS error: self-hosted portal and Dev portal must have the same domain");
                        }
                        return true;
                    }
                } else {
                    await this.logger.trackEvent("Logout", { message: "Was not able to get token for delegated auth." });
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