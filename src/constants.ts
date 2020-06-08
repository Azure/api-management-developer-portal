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
    soap = "soap",
    http = "http"
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

export const hashSignOut = "signout";
export const pageUrlSignIn = "/signin";
export const pageUrlSignInSso = "/signinsso";
export const pageUrlSignUp = "/signup";
export const pageUrlSignUpOAuth = "/signup-oauth";
export const pageUrlProfile = "/profile";
export const pageUrlHome = "/";
export const pageUrl404 = "/404";
export const pageUrl500 = "/500";
export const pageUrlChangePassword = "/change-password";
export const pageUrlConfirmPassword = "/confirm-password";
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
 * Maximum number of items to show in a paginated view.
 */
export const defaultPageSize = 50;

/**
 * Default input delay before changes take effect.
 */
export const defaultInputDelayMs = 600;

/**
 * Known setting names.
 */
export enum SettingNames {
    backendUrl = "backendUrl",
    managementApiUrl = "managementApiUrl",
    managementApiVersion = "managementApiVersion",
    managementApiAccessToken = "managementApiAccessToken"
};

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
    authorizationCode = "authorizationCode",

    /**
     * The Client Credentials grant type is used by clients to obtain an access token outside of
     * the context of a user.
     */
    clientCredentials = "clientCredentials"
}