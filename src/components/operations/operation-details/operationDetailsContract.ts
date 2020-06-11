import { Contract } from "@paperbits/common";

export interface OperationDetailsContract extends Contract { 
    /**
     * Indicates whether "Try" button should appear on the operation details widget.
     */
    enableConsole?: boolean;

    /**
     * Defines how schema gets presented in operation details by default, e.g. "table" or "raw".
     */
    defaultSchemaView?: string;
}
