import { LocalStyles } from "@paperbits/common/styles";

export class OperationDetailsModel {
    /**
     * Indicates whether "Try" button should appear on the operation details widget.
     */
    public enableConsole?: boolean;

    /**
     * Defines how schema gets presented in operation details by default, e.g. "table" or "raw".
     */
    public defaultSchemaView?: string;

    /**
     * Indicates whether operation details should appear in the visible area (for example if API details is too long).
     */
    public enableScrollTo?: boolean;

    /**
     * Indicates whether the Test console should use CORS proxy vs direct calls from the browser.
     */
    public useCorsProxy?: boolean;

    /**
     * Indicates include all hostnames to the test console.
     */
    public includeAllHostnames?: boolean;

    /**
     * Show operation attribute values examples in a column in tables.
     */
    public showExamples?: boolean;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};

    constructor() {
        this.enableConsole = true;
    }
}
