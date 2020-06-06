import { Representation } from "../representation";

export class ConsoleRepresentation {
    public readonly sample: string;
    public readonly contentType: string;
    public readonly schemaId?: string;
    public readonly typeName?: string;

    constructor(contract: Representation) {
        this.sample = contract.example;
        this.contentType = contract.contentType;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;
    }
}
