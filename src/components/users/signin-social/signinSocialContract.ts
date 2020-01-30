import { Contract } from "@paperbits/common";

export interface SigninSocialContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: any;

    /**
     * Keys of user roles.
     */
    roles?: string[];

    /**
     * Label on AAD button.
     */
    aadLabel: string;

    /**
     * Label on AAD B2C button.
     */
    aadB2CLabel: string;
 }
