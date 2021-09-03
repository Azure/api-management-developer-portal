import { RepresentationExample } from "./representationExample";
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
    public readonly examples: RepresentationExample[];

    constructor(contract?: RepresentationContract) {
        this.contentType = contract.contentType;
        this.example = contract.sample || contract.generatedSample;
        this.schemaId = contract.schemaId;
        this.typeName = contract.typeName;
        this.examples = [];

        if (this.contentType === KnownMimeTypes.FormData) {
            if (contract.formParameters?.length > 0) {
                this.formParameters = contract.formParameters.map(parameterContract => new Parameter("body", parameterContract));
            }
        }

        if (contract.examples) {
            for (const key of Object.keys(contract.examples)) {
                const exampleObject = contract.examples[key];
                this.examples.push(new RepresentationExample(
                    key,
                    exampleObject.description,
                    exampleObject.value,
                    this.contentType));
            }
            this.example = null;
        }
        else if (this.example) {
            this.examples.push(new RepresentationExample(
                null,
                "",
                this.example,
                this.contentType));
        }
    }
}
