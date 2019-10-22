import { RepresentationContract } from "../../contracts/representation";

export class ConsoleRepresentation {
    public sample: string;
    public contentType: string;
    public schemaId?: string;
    public typeName?: string;

    constructor(contract: RepresentationContract) {
        this.sample = contract.sample;
        this.contentType = contract.contentType;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;
    }

    public toRepresentation(): RepresentationContract {
        const representation: RepresentationContract = {
            contentType: this.contentType,
            sample: this.sample,
            schemaId: this.schemaId,
            typeName: this.typeName
        };
        return representation;
    }
}
