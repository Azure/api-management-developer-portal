import { AuthorizationServer } from "./../../../models/authorizationServer";

export class OperationDetailsModel {
    /**
     * Indicates whether "Try" button should appear on the operation details widget.
     */
    public enableConsole?: boolean;

    /**
     * External OAuth servers associated with API of this operation.
     */
    public authorizationServers: AuthorizationServer[];

    constructor() {
        this.enableConsole = true;
    }
}
