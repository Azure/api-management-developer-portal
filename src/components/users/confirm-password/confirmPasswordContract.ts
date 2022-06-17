import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ConfirmPasswordContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
