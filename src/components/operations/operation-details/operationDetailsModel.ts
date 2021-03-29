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

    constructor() {
        this.enableConsole = true;
    }
}
