import { AadClientConfig } from "./aadClientConfig";

export interface AadB2CClientConfig extends AadClientConfig {
    /**
     * Sign-in policy name. Only applies to AAD B2C identity provider.
     */
    signinPolicyName: string;

    /**
     * Sign-up policy name. Only applies to AAD B2C identity provider.
     */
    signupPolicyName: string;

    /**
     * Password reset policy name. Only applies to AAD B2C identity provider.
     */
    passwordResetPolicyName: string;
}