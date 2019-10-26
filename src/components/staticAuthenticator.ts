import { IAuthenticator } from "../authentication";

export class StaticAuthenticator implements IAuthenticator {
    private accessToken: string;

    public getAccessToken(): string {
        return this.accessToken;
    }

    public setAccessToken(token: string): void {
        this.accessToken = token;
    }

    public clearAccessToken(): void {
        this.accessToken = undefined;
    }

    public isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}