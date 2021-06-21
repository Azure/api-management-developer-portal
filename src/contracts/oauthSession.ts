export interface OAuthSession {
    authenticationFlow: string;
    authenticationCallback: (accessToken: string) => void;
    authenticationErrorCallback: (error: Error) => void;
    loginUrl: string;
    redirectUri: string;
    clientId: string;
    issuer: string;
    tokenEndpoint: string;
    scope: string;
}