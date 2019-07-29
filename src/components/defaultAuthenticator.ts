import * as moment from "moment";
import { Utils } from "../utils";
import { IAuthenticator } from "../authentication/IAuthenticator";
import { Router } from "@paperbits/common/routing";

export class DefaultAuthenticator implements IAuthenticator {
    constructor(private readonly router: Router) { }

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

        // Uncomment when switched to ARM contracts:
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

    public isUserSignedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser();
    }

    private validateSharedAccessSignature(accessToken: string): void {
        const regex = /^\w*\&(\d*)\&/gm;
        const match = regex.exec(accessToken);

        if (!match && match.length < 2) {
            throw new Error(`Access token format is not valid.`);
        }

        const expirationDateUtc = moment(match[1]);

        if (moment().utc() > expirationDateUtc) {
            throw new Error(`Access token has expired.`);
        }
    }

    private validateBearerToken(accessToken: string): void {
        const decodedToken = Utils.parseJwt(accessToken);
        const now = Date.now().valueOf() / 1000;

        if (now >= decodedToken.exp) {
            throw new Error(`Access token has expired.`);
        }
    }

    public validateAccessToken(accessToken: string): void {
        if (accessToken.startsWith("SharedAccessSignature ")) {
            this.validateBearerToken(accessToken.replace("Bearer ", ""));
            return;
        }

        if (accessToken.startsWith("Bearer ")) {
            this.validateSharedAccessSignature(accessToken.replace("SharedAccessSignature ", ""));
            return;
        }

        throw new Error(`Access token format is not valid. Please use "Bearer" or "SharedAccessSignature".`);
    }
}