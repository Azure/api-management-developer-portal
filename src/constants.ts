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
export const defaultPageSize = 10;

/**
 * Maximum number of API change logs to show in one page
 */
export const apiChangeLogPageSize = 100;
