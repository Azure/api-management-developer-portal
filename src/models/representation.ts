import { Parameter } from "./parameter";
import { RepresentationContract } from "../contracts/representation";

export class Representation {
    public contentType: string;
    public generatedSample: string;
    public schemaId: string;
    public typeName: string;
    public formParameters: Parameter[];

    constructor(contract?: RepresentationContract) {
        this.contentType = contract.contentType;
        this.generatedSample = contract.generatedSample;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;
    }
}
