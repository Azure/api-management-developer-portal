import { AuthorizationServerForClient } from "./authorizationServer";

export interface BearerTokenSendingMethod {
    sendingMethodType: string;
    isChecked: boolean;
}

export interface OAuth2AuthenticationSettings {
    authorizationServerId?: string;
    scope?: string;
    authorizationServer: AuthorizationServerForClient;
}

export interface OpenIdAuthenticationSettings {
    openidProviderId?: string;
    bearerTokenSendingMethods?: BearerTokenSendingMethod[];
}

export interface AuthenticationSettings {
    oAuth2?: OAuth2AuthenticationSettings;
    openid?: OpenIdAuthenticationSettings;
    oAuth2AuthenticationSettings: OAuth2AuthenticationSettings[];
    openidAuthenticationSettings: OpenIdAuthenticationSettings[];
}