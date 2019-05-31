export interface IAuthenticator {
    getAccessToken(): string;
    setAccessToken(accessToken: string): void;
    getUser(): string;
    setUser(userId: string): void;
    clearAccessToken(): void;
    isUserLoggedIn(): boolean;
}