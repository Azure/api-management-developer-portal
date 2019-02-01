import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { RequestContract } from "../contracts/request";

export class Request {
    public description?: string;
    public queryParameters: Parameter[];
    public headers: Parameter[];
    public representations: Representation[];

    constructor(contract?: RequestContract) {
        this.queryParameters = [];
        this.headers = [];
        this.representations = [];

        if (contract) {
            this.description = contract.description;

            this.queryParameters = contract.queryParameters
                ? contract.queryParameters.map(x => new Parameter(x))
                : [];

            this.headers = contract.headers
                ? contract.headers.map(x => new Parameter(x))
                : [];

            this.representations = contract.representations
                ? contract.representations.map(x => new Representation(x))
                : [];
        }
    }
}