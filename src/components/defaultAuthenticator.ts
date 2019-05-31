import { IAuthenticator } from "../authentication/IAuthenticator";

export class DefaultAuthenticator implements IAuthenticator {
    public getAccessToken(): string {
        let accessToken = null;

        if (location.pathname.startsWith("/signin-sso")) {
            accessToken = "SharedAccessSignature " + location.href.split("?token=").pop();
            this.setAccessToken(accessToken);
            location.assign("/");
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

    public isUserLoggedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser();
    }
}