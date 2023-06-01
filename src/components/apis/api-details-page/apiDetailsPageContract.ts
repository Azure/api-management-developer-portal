import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ApiDetailsPageContract extends Contract {
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
    styles?: LocalStyles;
    /**
    * Indicates whether "Try" button should appear on the operation details widget.
    */
    enableConsole?: boolean;

    /**
     * Defines how schema gets presented in operation details by default, e.g. "table" or "raw".
     */
    defaultSchemaView?: string;

    /**
     * Indicates whether the Test console should use CORS proxy vs direct calls from the browser.
     */
    useCorsProxy?: boolean;

    /**
    * Indicates include all hostnames to the test console.
    */
    includeAllHostnames?: boolean;

    /**
     * Show operation attribute values examples in a column in tables.
     */
    showExamples?: boolean;
}