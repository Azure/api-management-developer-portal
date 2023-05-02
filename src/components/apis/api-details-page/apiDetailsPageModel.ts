import { LocalStyles } from "@paperbits/common/styles";

export class ApiDetailsPageModel {
    /**
     * Group operations by tag
     */
    groupOperationsByTag: boolean;

    /**
     * Allow switching between URL paths and operation names
     */
    showUrlPath: boolean;

    /**
     * Indicated that the text of the menu items should wrap to new line if it's too long.
     */
    wrapText: boolean;

    /**
     * Widget local styles
     */
    styles?: LocalStyles = {};
}