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
        this.example = contract.sample || contract.generatedSample;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;

        if (this.example) {
            if (this.contentType.includes("/xml")) {
                this.example = Utils.formatXml(this.example);
                this.exampleFormat = "xml";
            }

            if (this.contentType.includes("/json")) {
                this.example = Utils.formatJson(this.example);
                this.exampleFormat = "json";
            }
        }
    }
}
