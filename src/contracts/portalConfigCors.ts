/**
 * CORS policy of the portal that defines origins from which the browser is allowed to load resources.
 */
export interface PortalConfigCors {
    /**
     * Allowed origins, e.g. `https://trusted.com`.
     */
    allowedOrigins: string[];

    /** 
     * Possible future extensions:
     * "allowedMethods": [],
     * "allowedHeaders": []
     */
}