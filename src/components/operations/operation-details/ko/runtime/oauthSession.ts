export interface OAuthSession {
    [apiName: string]: {
        grantType: string;
        accessToken: string;
    };
}