import { ArmResource } from "./armResource";


/**
 * External OAuth authorization server settings.
 */
export interface AuthorizationServerContract extends ArmResource {
    properties: AuthorizationServerProperties;
}

interface AuthorizationServerProperties {
    /**
     * User-friendly authorization server name, e.g. "Contoso Auth".
     */
    displayName?: string;

    /**
     * Description of the authorization server. Can contain HTML formatting tags.
     */
    description: string;

    /**
     * Authorization endpoint, e.g. "https://accounts.google.com/o/oauth2/auth".
     */
    authorizationEndpoint: string;

    /**
     * HTTP verbs supported by the authorization endpoint, e.g. GET or POST.
     */
    authorizationMethods: string[];

    /**
     * Token endpoint, e.g. "https://accounts.google.com/o/oauth2/token"
     */
    tokenEndpoint: string;

    /**
     * If true, authorization server will include state parameter from the authorization request to its response.
     * Client may use state parameter to raise protocol security.
     */
    supportState: boolean;

    /**
     * Access token scope that is going to be requested by default. Can be overridden at the API level.
     * Should be provided in the form of a string containing space-delimited values.
     * Example: "profile email"
     */
    defaultScope: string;

    /**
     * Method of authentication supported by the token endpoint of this authorization server.
     * Possible values are "Basic" and/or "Body". When "Body" is specified, client credentials and other parameters
     * are passed within the request body in the application/x-www-form-urlencoded format.
     */
    clientAuthenticationMethod: string[];

    /**
     * Additional parameters required by the token endpoint of this authorization server represented as an array of
     * JSON objects with name and value string properties, i.e. {"name" : "name value", "value": "a value"}.
     */
    tokenBodyParameters: string[];

    /**
     * Form of an authorization grant, which the client uses to request the access token.
     * Examples: "authorization_code", "client_credentials", "implicit".
     */
    grantTypes: string[];

    /**
     * Specifies the mechanism by which access token is passed to the API.
     */
    bearerTokenSendingMethods: string[];


    /**
     * Client or application ID registered with this authorization server.
     */
    clientId: string;
}

