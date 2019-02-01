import { Parameter } from "./parameter";
import { Representation } from "./representation";
import { ResponseContract } from "../contracts/response";

export class Response {
    public headers?: Parameter[];
    public statusCode: string;
    public representations?: Representation[];
    public description?: string;

    constructor(contract?: ResponseContract) {
        this.statusCode = contract.statusCode;
        this.description = contract.description;

        this.headers = contract.headers
            ? contract.headers.map(x => new Parameter(x))
            : [];

        this.representations = contract.representations
            ? contract.representations.map(x => new Representation(x))
            : [];
    }
}