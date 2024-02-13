export interface AuthorizationServerForClient {
    name: string;

    /**
     * User-friendly authorization server name, e.g. "Contoso Auth".
     */
    displayName: string;

    /**
     * Description of the authorization server. Can contain HTML formatting tags.
     */
    description: string;

    /**
     * Client or application ID registered with this authorization server.
     */
    clientId: string;

    /**
     * Authorization endpoint, e.g. "https://accounts.google.com/o/oauth2/auth".
     */
    authorizationEndpoint: string;

    /**
     * Token endpoint, e.g. "https://accounts.google.com/o/oauth2/token"
     */
    tokenEndpoint: string;

    /**
     * Form of an authorization grant, which the client uses to request the access token.
     * Examples: "authorization_code", "client_credentials", "implicit".
     */
    grantTypes: string[];

    /**
     * Access token scope that is going to be requested by default. Can be overridden at the API level.
     * Should be provided in the form of a string containing space-delimited values.
     * Example: ["profile", "email"]
     */
    scopes: string[];

    /**
     * Is this provider used for the test console?
     */
    useInTestConsole: boolean;

    /**
     * Is this provider used for API documentation?
     */
    useInApiDocumentation: boolean;
}