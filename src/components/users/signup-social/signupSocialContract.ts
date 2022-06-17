import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface SignupSocialContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
