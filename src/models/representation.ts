import { Utils } from "../utils";
import { RepresentationContract } from "../contracts/representation";
import { Parameter } from "./parameter";
import { KnownMimeTypes } from "./knownMimeTypes";

export class Representation {
    public readonly contentType: string;
    public readonly example: string;
    public readonly exampleFormat: string;
    public readonly schemaId: string;
    public readonly typeName: string;
    public readonly formParameters: Parameter[];

    constructor(contract?: RepresentationContract) {
        this.contentType = contract.contentType;
        this.example = contract.sample || contract.generatedSample;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;

        if (this.contentType === KnownMimeTypes.FormData) {
            if (contract.formParameters?.length > 0) {
                this.formParameters = contract.formParameters.map(parameterContract => new Parameter("body", parameterContract));
            }
        }

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
