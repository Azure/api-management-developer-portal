import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { RequestContract } from "../contracts/request";
import { KnownMimeTypes } from "./knownMimeTypes";

export class Request {
    public readonly description?: string;
    public readonly queryParameters: Parameter[];
    public readonly headers: Parameter[];
    public readonly representations: Representation[];

    /**
     * Returns "true" if this request is meaningful from documentation prospective.
     */
    public isMeaningful(): boolean {
        return !!this.description || this.representations.some(x => !!x.typeName || x.formParameters?.length > 0);
    }

    /**
     * Returns "true" if this request has multipart body.
     */
    public isFormData(): boolean {
        return this.representations.some(x => x.contentType === KnownMimeTypes.FormData);
    }

    /**
     * Returns all meaningful representations.
     */
    public meaningfulRepresentations(): Representation[] {
        return this.representations.filter(representation =>
            !!representation.typeName // has type definition reference
            || representation.formParameters?.length > 0 // has form parameters
            || representation.examples?.length > 0 // has examples
        );
    }

    constructor(contract?: RequestContract) {
        this.queryParameters = [];
        this.headers = [];
        this.representations = [];

        if (contract) {
            this.description = contract.description;

            this.queryParameters = contract.queryParameters
                ? contract.queryParameters.map(x => new Parameter("query", x))
                : [];

            this.headers = contract.headers
                ? contract.headers.map(x => new Parameter("header", x))
                : [];

            this.representations = contract.representations
                ? contract.representations.map(x => new Representation(x))
                : [];
        }
    }
}