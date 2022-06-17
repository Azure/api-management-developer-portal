import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface SignupContract extends Contract {
    requireHipCaptcha: boolean;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
