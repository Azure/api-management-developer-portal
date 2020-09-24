export interface StoredCredentials {
    grantType: string;
    accessToken: string;
}

export interface OAuthSession {
    [apiName: string]: StoredCredentials;
}