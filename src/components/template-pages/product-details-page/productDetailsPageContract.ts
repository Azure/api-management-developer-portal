import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ProductDetailsPageContract extends Contract {
    /**
     * Indicated that the text of the menu items should wrap to new line if it's too long.
     */
    wrapText: boolean;

    /**
     * Widget local styles
     */
    styles?: LocalStyles;
}