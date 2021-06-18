import { LocalStyles } from "@paperbits/common/styles";

export class SigninSocialModel { 
    /**
     * Widget local styles.
     */
    public styles: LocalStyles;

    /**
     * Keys of user roles.
     */
    public roles?: string[];

    /**
     * Label on AAD button.
     */
    public aadLabel?: string;

    /**
     * AAD reply URL, e.g. `/signin`.
     */
     public aadReplyUrl?: string;

    /**
     * Label on AAD B2C button.
     */
    public aadB2CLabel?: string;

    /**
     * AAD B2C reply URL, e.g. `/signin`.
     */
    public aadB2CReplyUrl?: string;

    constructor() {
        this.styles = { appearance: "components/button/default" };
    }
}
