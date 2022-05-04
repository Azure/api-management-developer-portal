export interface OAuth2AuthenticationSettings {
    authorizationServerId?: string;
    scope?: string;
}

export interface OpenIdAuthenticationSettings {
    openidProviderId?: string;
    bearerTokenSendingMethods?: string[];
}

export interface AuthenticationSettings {
    oAuth2?: OAuth2AuthenticationSettings;
    openid?: OpenIdAuthenticationSettings;
}