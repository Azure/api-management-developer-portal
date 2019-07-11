import { TagContract } from "../contracts/tag";

export class Tag {
    public id: string;
    public name: string;

    constructor(contract: TagContract) {
        this.id = contract.id;
        this.name = contract.properties.displayName;
    }
}