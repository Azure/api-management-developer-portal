import { Contract } from "@paperbits/common";
import { SecurityContract } from "@paperbits/common/security";

export interface SigninSocialContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: any;

    /**
     * Security settings.
     */
     security?: SecurityContract;

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
