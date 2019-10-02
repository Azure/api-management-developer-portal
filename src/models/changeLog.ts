import { ChangeLogContract } from "../contracts/apiChangeLog";
import { Utils } from "../utils";

export class ChangeLog {
    public readonly id: string;
    public name: string;
    public createdDateTime: string;
    public updatedDateTime: string;
    public notes: string;

    constructor(id: string, contract?: ChangeLogContract) {
        this.id = id;

        if (!contract) {
            return;
        }

        if (contract.properties) {
            this.name = contract.name;
            this.notes = contract.properties.notes;
            this.createdDateTime = Utils.formatLogTime(contract.properties.createdDateTime);
            this.updatedDateTime = Utils.formatLogTime(contract.properties.updatedDateTime);
        }
    }
}