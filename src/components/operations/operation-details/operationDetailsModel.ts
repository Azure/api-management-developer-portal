import { AuthorizationServer } from "./../../../models/authorizationServer";

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
     * External OAuth servers associated with API of this operation.
     */
    public authorizationServers: AuthorizationServer[];

    constructor() {
        this.enableConsole = true;
    }
}
