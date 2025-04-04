/**
 * Generic string value container
 */
export interface DelegationSettings {
    /**
     * Specifies whether signin is delegated to external system.
     */
    signin: boolean;

    /**
     * Specifies whether Product subscribe is delegated to external system.
     */
    subscribe: boolean;
}