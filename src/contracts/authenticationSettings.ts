export interface BearerTokenSendingMethod {
    sendingMethodType: string;
    isChecked: boolean;
}

export interface OAuth2AuthenticationSettings {
    authorizationServerId?: string;
    scope?: string;
}

export interface OpenIdAuthenticationSettings {
    openidProviderId?: string;
    bearerTokenSendingMethods?: BearerTokenSendingMethod[];
}

export interface AuthenticationSettings {
    oAuth2?: OAuth2AuthenticationSettings;
    openid?: OpenIdAuthenticationSettings;
}