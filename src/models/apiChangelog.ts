import { ChangeLogContract } from "../contracts/apiChangeLog";

export class ApiChangeLog {
    /**
     * Unique ARM identifier.
     */
    id: string

    /**
    *  The date when this API change log is created
    */
    createdDateTime?: string;

    /**
     *  The date when this API change log is edited and updated
     */
    updatedDateTime?: string;

    /**
     *  The notes of this API change
     */
    notes?: string;

    constructor(contract: ChangeLogContract) {
        this.id = contract.id;
        this.createdDateTime = contract.properties.createdDateTime;
        this.updatedDateTime = contract.properties.updatedDateTime;
        this.notes = contract.properties.notes;
    }
}