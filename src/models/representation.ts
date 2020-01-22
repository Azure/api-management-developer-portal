import { Utils } from "../utils";
import { RepresentationContract } from "../contracts/representation";

export class Representation {
    public contentType: string;
    public example: string;
    public exampleFormat: string;
    public schemaId: string;
    public typeName: string;

    constructor(contract?: RepresentationContract) {
        this.contentType = contract.contentType;
        this.example = contract.sample;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;

        if (contract.sample) {
            this.example = contract.sample;

            if (contract.contentType.contains("/xml")) {
                this.example = Utils.formatXml(contract.sample);
                this.exampleFormat = "xml";
            }

            if (contract.contentType.contains("/json")) {
                this.example = Utils.formatJson(contract.sample);
                this.exampleFormat = "json";
            }
        }
    }
}
