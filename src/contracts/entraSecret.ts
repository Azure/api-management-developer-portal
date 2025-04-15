export interface EntraSecretContract {
    /**
     * Entra secret object.
     */
    entra: EntraSecretObject;
}

export interface EntraSecretObject {
    /**
     * Application Entra secret.
     */
    clientSecret: string;

    /**
     * Secret expiration date in ISO 8601 format.
     * Example: 2023-10-01T00:00:00Z
     */
    expiresAt: string;
}