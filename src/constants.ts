import { OVERRIDE_PORT_KEY } from "@azure/api-management-custom-widgets-scaffolder";

/**
 * APIM service SKU names.
 */
export enum ServiceSkuName {
    Developer = "Developer",
    Basic = "Basic",
    Standard = "Standard",
    Premium = "Premium",
    Consumption = "Consumption"
}

/**
 * Types of API.
 */
export enum TypeOfApi {
    webSocket = "websocket",
    soap = "soap",
    http = "http",
    graphQL = "graphql"
}

/**
 * Types of body format.
 */
export enum RequestBodyType {
    raw = "raw",
    string = "string",
    binary = "binary",
    form = "form"
}

/**
 * Types of identity providers (values are case-sensitive).
 */
export enum IdentityProviders {
    basic = "Basic",
    aad = "Aad",
    aadB2C = "AadB2C"
}

export enum AadEndpoints {
    primary = "login.microsoftonline.com",
    legacy = "login.windows.net"
}

export enum AadClientLibrary {
    v1 = "v1",
    v2 = "v2"
}

export const AadClientLibraryV2 = "MSAL-2";

/**
 * Types of direction (e.g. for sorting of elements in a table)
 */
export enum Direction {
    asc = "asc",
    desc = "desc"
}

export const defaultAadTenantName = "common";

export const closeAccount = "close-account";
export const hashSignOut = "signout";
export const pageUrlSignIn = "/signin";
export const pageUrlSignInSso = "/signinsso";
export const pageUrlSignUp = "/signup";
export const pageUrlSignUpOAuth = "/signup-oauth";
export const pageUrlProfile = "/profile";
export const pageUrlHome = "/";
export const pageUrl404 = "/404";
export const pageUrl500 = "/500";
//[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="False positive")]
export const pageUrlChangePassword = "/change-password";
//[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="False positive")]
export const pageUrlConfirmPassword = "/confirm-password";
//[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="False positive")]
export const pageUrlResetPassword = "/reset-password";
export const pageUrlReference = "/api-details";

/**
 * Permalinks pointing to resources that cannot be added, modified or modified.
 */
export const reservedPermalinks = [
    pageUrlHome,
    pageUrl404,
    pageUrl500,
    pageUrlSignIn,
    pageUrlSignInSso,
    pageUrlSignUp,
    pageUrlSignUpOAuth,
    pageUrlProfile,
    pageUrlChangePassword,
    pageUrlConfirmPassword,
    hashSignOut,
    "/confirm-v2/identities/basic/signup",
    "/confirm/invitation",
    "/confirm-v2/password",
    "/captcha"
];

/**
 * Maximum number of items to request from Managament API.
 */
export const defaultPageSize = 50;

/**
 * Default value of first page in a paginated view.
 */
export const firstPage = 1;

/**
 * Maximum number of pages to show in a paginated view.
 */
export const showMaximumPages = 3;

/**
 * Default input delay before changes take effect.
 */
export const defaultInputDelayMs = 600;

/**
 * Developer portal appType for email notifications.
 */
export const AppType = "developerPortal";

/**
 * HTML Editor Settings - HTML injection widget editor
 */
export const HtmlEditorSettings = {
    id: "htmlEditor",
    config: {
        language: "html",
        readOnly: false,

        lineHeight: 17,
        automaticLayout: true,
        minimap: {
            enabled: false
        },
    }
};

/**
 * Query Editor Settings - GraphQL Console
 */
export const QueryEditorSettings = {
    id: "queryEditor",
    config: {
        language: "graphqlQuery",
        readOnly: false,
    }
};

/**
 * Variables Editor Settings - GraphQL Console
 */
export const VariablesEditorSettings = {
    id: "variablesEditor",
    config: {
        language: "json",
        readOnly: false,
    }
};

/**
 * Response Settings - GraphQL Console
 */
export const ResponseSettings = {
    id: "responseEditor",
    config: {
        language: "json",
        readOnly: true,
    }
};

/**
* Graphql types
*/
export enum GraphqlTypes {
    query = "query",
    mutation = "mutation",
    subscription = "subscription",
}

/**
* Graphql protocols
*/
export enum GraphqlProtocols {
    http = "http",
    https = "https",
    ws = "ws",
    wss = "wss"
}

/**
* Graphql websocket message type
*/
export enum GqlWsMessageType {
    connection_init = "connection_init",
    subscribe = "subscribe",
    next = "next"
}

/**
* Graphql types for documentation
*/
export enum GraphqlTypesForDocumentation {
    query = "Query",
    mutation = "Mutation",
    subscription = "Subscription",
    objectType = "Object Type",
    inputObjectType = "Input Object Type",
    enumType = "Enum Type",
    scalarType = "Scalar Type",
    unionType = "Union Type",
    interfaceType = "Interface Type"
}

export enum GraphqlCustomFieldNames {
    selected = "isSelectedForDoc",
    type = "collectionTypeForDoc",
}

export const GraphqlDefaultScalarTypes = ["Int", "Float", "String", "Boolean", "ID"]

export enum GraphqlFieldTypes {
    args = "args",
    fields = "_fields",
    values = "_values",
    types = "_types"
}

export enum GraphqlMetaField {
    typename = "__typename"
}

export const graphqlSubProtocol = "graphql-transport-ws";

/**
 * Known setting names.
 */
export enum SettingNames {
    backendUrl = "backendUrl",
    managementApiUrl = "managementApiUrl",
    managementApiAccessToken = "managementApiAccessToken",
    aadClientConfig = "aad",
    aadB2CClientConfig = "aadB2C",
    developerPortalType = "developerPortalType"
}

export enum DeveloperPortalType {
    selfHosted = "self-hosted-portal",
    managed = "dev-portal"
}

/**
 * The OAuth framework specifies several grant types for different use cases.
 */
export enum GrantTypes {
    /**
     * The Implicit flow was a simplified OAuth flow previously recommended for native apps and
     * JavaScript apps where the access token was returned immediately without an extra
     * authorization code exchange step.
     */
    implicit = "implicit",

    /**
     * The Authorization Code grant type is used by confidential and public clients to exchange
     * an authorization code for an access token.
     */
    authorizationCode = "authorization_code",

    /**
     * Proof Key for Code Exchange (abbreviated PKCE) is an extension to the authorization code
     * flow to prevent CSRF and authorization code injection attacks.
     */
    authorizationCodeWithPkce = "authorization_code (PKCE)",

    /**
     * The Client Credentials grant type is used by clients to obtain an access token outside of
     * the context of a user.
     */
    clientCredentials = "client_credentials",

    /**
     * The Resource owner password grant type is used to exchange a username and password for an access
     * token directly.
     */
    //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="False positive")]
    password = "password"
}

export const managementApiVersion = "2021-04-01-preview";

/**
 * Header name to track developer portal type.
 */
export const portalHeaderName = "x-ms-apim-client";

export const releaseNameFormat = "YYYYMMDDHHmmss";

export const genericHttpRequestError = "Server error. Unable to send request. Please try again later.";

export const oauthSessionKey = "oauthSession";
export const reservedCharTuplesForOData: [string, string][] = [["'", "''"]];

/**
 * List of attributes for an iframe allow.
 */
export const iframeAllows = "clipboard-read; clipboard-write; camera; microphone; geolocation";

/**
 * List of allowed attributes for a sandboxed iframe.
 */
export const iframeSandboxAllows = "allow-scripts allow-modals allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-presentation allow-orientation-lock allow-pointer-lock";

/**
 * List of downloadable content types
 */
export const downloadableTypes = ["image", "video", "audio", "zip", "pdf"];

export const WarningBackendUrlMissing = `Backend URL is missing. See setting <i>backendUrl</i> in the configuration file <i>config.design.json</i>. OAuth authentication in Test console and Captcha widget requires <i>backendUrl</i> setting in config.runtime.json, pointing to your APIM service developer portal URL. In addition, it requires the origin to be specified in CORS settings (e.g. https://contoso.com). <a href="https://aka.ms/apimdocs/portal/self-hosted-settings" target="_blank">Learn more</a>.`

/**
 * Signals that the widgets' source is being overridden (for local development). Optionally holds URL to overrides' config files.
 */
export const overrideConfigSessionKeyPrefix = OVERRIDE_PORT_KEY + "_";

/**
 * Key under which is saved in session storage a boolean for dismissed Custom Widget override toasts
 */
export const overrideToastSessionKeyPrefix = "MS_APIM_CW_override_toast_dismissed_"
