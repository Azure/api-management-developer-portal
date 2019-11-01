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

export const hashSignOut = "signout";
export const pageUrlSignIn = "/signin";
export const pageUrlSignInSso = "/signinsso";
export const pageUrlSignUp = "/signup";
export const pageUrlProfile = "/profile";
export const pageUrlHome = "/";
export const pageUrl404 = "/404";
export const pageUrl500 = "/500";
export const pageUrlChangePassword = "/change-password";
export const pageUrlConfirmPassword = "/confirm-password";
export const pageUrlResetPassword = "/reset-password";
export const pageUrlChangelog = "/api-changelog";
export const pageUrlReference = "/apis";

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
    pageUrlProfile,
    pageUrlChangePassword,
    pageUrlConfirmPassword,
    pageUrlChangelog,
    hashSignOut,
    "/publish",
    "/confirm-v2/identities/basic/signup",
    "/confirm/invitation",
    "/confirm-v2/password",
    "/captcha"
]

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
export const SettingNames = {
    backendUrl: "backendUrl",
    managementApiUrl: "managementApiUrl",
    managementApiVersion: "managementApiVersion",
    managementApiAccessToken: "managementApiAccessToken"
};