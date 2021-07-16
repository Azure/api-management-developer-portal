import { TagContract } from "../contracts/tag";

export class Tag {
    public readonly id: string;
    public readonly name: string;

    constructor(contract: TagContract) {
        this.id = contract.id;
        this.name = contract.properties.displayName;
    }
}