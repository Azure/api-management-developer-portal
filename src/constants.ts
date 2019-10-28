export enum HostType {
    Proxy = "Proxy",
    Portal = "Portal",
    Mapi = "Management"
}

export enum ServiceSkuName {
    Developer = "Developer",
    Basic = "Basic",
    Standard = "Standard",
    Premium = "Premium",
    Consumption = "Consumption"
}

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
export const pageUrlProfile = "/profile";
export const pageUrlHome = "/";
export const pageUrl404 = "/404";
export const pageUrl500 = "/500";
export const pageUrlChangePassword = "/change-password";

/**
 * Maximum number of items to show in a paginated view.
 */
export const defaultPageSize = 50;

export const defaultInputDelayMs = 600;

export const SettingNames = {
    managementApiUrl: "managementApiUrl",
    managementApiVersion: "managementApiVersion",
    managementApiAccessToken: "managementApiAccessToken"
};