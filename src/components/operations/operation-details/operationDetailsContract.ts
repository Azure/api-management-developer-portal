import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface OperationDetailsContract extends Contract {
    /**
     * Indicates whether "Try" button should appear on the operation details widget.
     */
    enableConsole?: boolean;

    /**
     * Defines how schema gets presented in operation details by default, e.g. "table" or "raw".
     */
    defaultSchemaView?: string;

    /**
     * Indicates whether operation details should appear in the visible area (for example if API details is too long).
     */
    enableScrollTo?: boolean;

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

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
