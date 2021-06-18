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
     * AAD reply URL, e.g. `/signin`.
     */
    aadReplyUrl: string;

    /**
     * Label on AAD B2C button.
     */
    aadB2CLabel: string;

    /**
     * AAD B2C reply URL, e.g. `/signin`.
     */
    aadB2CReplyUrl: string;
}
