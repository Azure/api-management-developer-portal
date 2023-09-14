import { LocalStyles } from "@paperbits/common/styles";

export class ProductDetailsPageModel {
    /**
     * Indicated that the text of the menu items should wrap to new line if it's too long.
     */
    wrapText: boolean;

    /**
     * Widget local styles
     */
    styles?: LocalStyles = {};
}