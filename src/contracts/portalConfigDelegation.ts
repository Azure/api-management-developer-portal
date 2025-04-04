export interface PortalConfigDelegation extends PortalConfigDelegationSecrets {
    /**
     * Indicates whether the portal sign-in/sign-up delegation is enabled.
     */
    delegateRegistration: boolean;

    /**
     * Indicates whether the product subscription delegation is enabled.
     */
    delegateSubscription: boolean;

    /**
     * URL of the website the sign-in/sign-up flows were delegated to.
     */
    delegationUrl: string;

}

export interface PortalConfigDelegationSecrets {
    /**
     * Encryption key used to validate delegation signature.
     */
    validationKey: string;

    /**
     * Secondary encryption key used to validate delegation signature.
     */
    validationSecondaryKey: string;
}
