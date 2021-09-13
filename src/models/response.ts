import { StatusCode } from "./statusCode";
import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { ResponseContract } from "../contracts/response";
import { Utils } from "../utils";

export class Response {
    public readonly identifier: string;
    public readonly headers: Parameter[];
    public readonly statusCode: StatusCode;
    public readonly representations: Representation[];
    public readonly description: string;

    /**
     * Returns "true" if this response is meaningful from documentation prospective.
     */
    public isMeaningful(): boolean {
        return !!this.description || this.representations.some(x => !!x.typeName || x.examples?.length > 0);
    }

    public meaningfulRepresentations(): Representation[] {
        return this.representations.filter(x => !!x.typeName || x.examples?.length > 0);
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