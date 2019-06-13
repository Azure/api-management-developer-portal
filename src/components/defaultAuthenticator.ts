import { Utils } from "../utils";
import { IAuthenticator } from "../authentication/IAuthenticator";
import { Router } from "@paperbits/common/routing";

export class DefaultAuthenticator implements IAuthenticator {
    constructor(private readonly router: Router) {}

    public getAccessToken(): string {
        let accessToken = null;

        if (location.pathname.startsWith("/signin-sso")) {
            accessToken = "SharedAccessSignature " + location.href.split("?token=").pop();
            this.setAccessToken(accessToken);
            this.router.navigateTo("/");
        }
        else {
            accessToken = sessionStorage.getItem("accessToken");
        }

        // Uncomment when swithed to ARM contracts:
        //
        // const decodedToken = Utils.parseJwt(accessToken);
        // const now = Date.now().valueOf() / 1000;
        //
        // if (now >= decodedToken.exp) {
        //     this.clearAccessToken();
        //     return null;
        // }

        return accessToken;
    }

    public setAccessToken(accessToken: string): void {
        sessionStorage.setItem("accessToken", accessToken);
    }

    public getUser(): string {
        return sessionStorage.getItem("current-user");
    }

    public setUser(userId: string): void {
        sessionStorage.setItem("current-user", userId);
    }

    public clearAccessToken(): void {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("current-user");
    }

    public isUserLoggedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser();
    }
}