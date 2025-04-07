/**
 * User identity contract.
 */
export interface Identity {
    /**
     * User unique identifier.
     */
    id: string;

    /**
     * User provider. i.e. Basic, AAD, etc.
     */
    provider: string;
}

export interface SmapiIdentity {
    /**
     * User unique identifier.
     */
    id: string;
}