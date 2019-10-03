import { ChangeLogContract } from "../contracts/apiChangeLog";
import { Utils } from "../utils";

/**
 *  API change log model
 */
export class ChangeLog {

    /**
     * Id of the change log
     */
    public readonly id: string;

    /**
     * Name of the change log
     */
    public name: string;

    /**
     * The change log's created date
     */
    public createdDateTime: string;

    /**
     * The change log's edited and updated date
     */
    public updatedDateTime: string;

    /**
     * The notes of the change log
     */
    public notes: string;

    constructor(id: string, contract?: ChangeLogContract) {
        this.id = id;

        if (!contract) {
            return;
        }

        if (contract.properties) {
            this.name = contract.name;
            this.notes = contract.properties.notes;
            this.createdDateTime = Utils.formatDateTime(contract.properties.createdDateTime);
            this.updatedDateTime = Utils.formatDateTime(contract.properties.updatedDateTime);
        }
    }
}