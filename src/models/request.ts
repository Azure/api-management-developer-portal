import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { RequestContract } from "../contracts/request";

export class Request {
    public description?: string;
    public queryParameters: Parameter[];
    public headers: Parameter[];
    public representations: Representation[];

    /**
     * Returns "true" if this request is meaningful from documentation prospective.
     */
    public isMeaningful(): boolean {
        return !!this.description || this.representations.some(x => !!x.typeName);
    }

    public meaningfulRepresentations(): Representation[] {
        return this.representations.filter(x => !!x.typeName || !!x.sample);
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