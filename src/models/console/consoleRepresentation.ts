import { Representation } from "../representation";

export class ConsoleRepresentation {
    public readonly sample: string;
    public readonly contentType: string;
    public readonly schemaId?: string;
    public readonly typeName?: string;

    constructor(representation: Representation) {
        this.sample = representation.examples?.length > 0 ? representation.examples[0].value : "";
        this.contentType = representation.contentType;
        this.schemaId = representation.schemaId;
        this.typeName = representation.typeName;
    }
}
