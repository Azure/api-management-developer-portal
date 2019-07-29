import { IAuthenticator } from "../authentication/IAuthenticator";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;
    private currentUserId: string;

    public getAccessToken(): string {
        return this.accessToken;
    }

    public setAccessToken(token: string): void {
        this.accessToken = `${token}`;
    }

    public getUser(): string {
        return this.currentUserId;
    }

    public setUser(userId: string): void {
        this.currentUserId = userId;
    }

    public clearAccessToken(): void {
        this.accessToken = undefined;
        this.currentUserId = undefined;
    }

    public isUserSignedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser();
    }
}