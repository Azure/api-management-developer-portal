import { ArmResource } from "./armResource";

export interface AuthorizationServer extends ArmResource  {
    properties: AuthProperties;
}

interface AuthProperties {
    displayName?: string;
    description: string;    
    clientRegistrationEndpoint: string;

    /**
     * Example: "https://accounts.google.com/o/oauth2/auth"
     */
    authorizationEndpoint: string;

    authorizationMethods: string[];

    /**
     * Example: "https://accounts.google.com/o/oauth2/token"
     */
    tokenEndpoint: string;

    supportState: boolean;

    /**
     * Example: "profile email"
     */
    defaultScope: string;

    clientAuthenticationMethod: string[];

    tokenBodyParameters: string[];

    grantTypes: string[];

    bearerTokenSendingMethods: string[];

    clientId: string;

    clientSecret: string;

    resourceOwnerUsername: string;

    resourceOwnerPassword: string;
}

