import { IAuthenticator } from "./../services/IAuthenticator";

export class DefaultAuthenticator implements IAuthenticator {
    public getAccessToken(): string {
        return sessionStorage.getItem("authToken");
    }

    public setAccessToken(token: string) {
        sessionStorage.setItem("authToken", `${token}`);
    }

    public getUser(): string {
        return sessionStorage.getItem("current-user");
    }

    public setUser(userId: string): void {
        sessionStorage.setItem("current-user", userId);
    }

    public clear(): void {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("current-user");
    }

    public isUserLoggedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser();
    }
}