import { StatusCode } from "./statusCode";
import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { ResponseContract } from "../contracts/response";
import { Utils } from "../utils";

export class Response {
    public identifier: string;
    public headers?: Parameter[];
    public statusCode: StatusCode;
    public representations?: Representation[];
    public description?: string;

    /**
     * Returns "true" if this response is meaningful from documentation prospective.
     */
    public isMeaningful(): boolean {
        return !!this.description || this.representations.some(x => !!x.typeName || !!x.example);
    }

    public meaningfulRepresentations(): Representation[] {
        return this.representations.filter(x => !!x.typeName || !!x.example);
    }

    constructor(contract?: ResponseContract) {
        this.identifier = Utils.getBsonObjectId();
        this.statusCode = new StatusCode(contract.statusCode);
        this.description = contract.description;

        this.headers = contract.headers
            ? contract.headers.map(header => new Parameter("header", header))
            : [];

        this.representations = contract.representations
            ? contract.representations
                .map(representation => new Representation(representation))
            : [];
    }
}