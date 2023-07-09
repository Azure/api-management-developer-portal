import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ProductDetailsContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
