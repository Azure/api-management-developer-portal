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

/**
 * Maximum number of items to show in a paginated view.
 */
export const defaultPageSize = 50;
export const apiReferencePageUrl = "/reference";
export const defaultInputDelayMs = 600;
