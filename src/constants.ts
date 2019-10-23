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

export const TypeOfApi = {
    soap: "soap",
    http: "http"
};

export const signinUrl = "/signin";
export const profileUrl = "/profile";
export const homeUrl = "/";
export const changePasswordUrl = "/change-password";

/**
 * Maximum number of items to show in a paginated view.
 */
export const defaultPageSize = 50;
export const apiDetailsPageUrl = "/reference";
export const productDetailsPageUrl = "/product";
export const defaultInputDelayMs = 600;
