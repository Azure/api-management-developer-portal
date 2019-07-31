import * as moment from "moment";
import { IAuthenticator, AcceessToken } from "./../authentication";
import { Utils } from "../utils";
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

    private parseSharedAccessSignature(accessToken: string): AcceessToken {
        const regex = /^\w*\&(\d*)\&/gm;
        const match = regex.exec(accessToken);

        if (!match && match.length < 2) {
            throw new Error(`ShredAccessSignature token format is not valid.`);
        }

        const dateTime = match[1];
        const dateTimeIso = `${dateTime.substr(0, 8)} ${dateTime.substr(8, 4)}`;
        const expirationDateUtc = moment(dateTimeIso).toDate();

        return { type: "SharedAccessSignature", expires: expirationDateUtc };
    }

    private parseBearerToken(accessToken: string): AcceessToken {
        const decodedToken = Utils.parseJwt(accessToken);
        const exp = moment(decodedToken.exp).toDate();

        return { type: "Bearer", expires: exp };
    }

    public parseAccessToken(token: string): AcceessToken {
        let accessToken: AcceessToken;

        if (token.startsWith("Bearer ")) {
            accessToken = this.parseBearerToken(token.replace("Bearer ", ""));
            return accessToken;
        }

        if (token.startsWith("SharedAccessSignature ")) {
            accessToken = this.parseSharedAccessSignature(token.replace("SharedAccessSignature ", ""));
            return accessToken;
        }

        throw new Error(`Access token format is not valid. Please use "Bearer" or "SharedAccessSignature".`);
    }
}