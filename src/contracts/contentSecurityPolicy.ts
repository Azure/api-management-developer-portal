/**
 * Content security policy mode.
 */
export enum ContentSecurityPolicyMode {
    /**
     * The browser will block requests not matching allowed origins.
     */
    enabled = "enabled",

    /**
     * The browser doesn't apply CSP.
     */
    disabled = "disabled",

    /**
     * The browser will report requests not matching allowed origins without blocking them.
     */
    reportOnly = "reportOnly"
}

/**
 * Content security policy of the portal that helps to detect and mitigate certain types of
 * attacks like XSS and data injection.
 */
export interface PortalConfigCsp {
    /**
     * The mode of CSP policy in the portal.
     */
    mode: ContentSecurityPolicyMode;

    /**
     * The URL used by browser to report CSP violations.
     */
    reportUri?: string;

    /**
     * Allowed sources, e.g. `*.trusted.com`, `trusted.com`, `https://`.
     */
    allowedSources: string[];

    /** 
     * Possible future extensions:
     * "allowedImageSources": [],
     * "allowedScriptSources": []
     * ...
     */
}