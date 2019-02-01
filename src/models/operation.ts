import { OperationContract } from "../contracts/operation";
import { Parameter } from "./parameter";
import { Request } from "./request";
import { Response } from "./response";

export class Operation {
    public id: string;
    public name: string;
    public description: string;
    public urlTemplate: string;
    public templateParameters: Parameter[];
    public method: string;
    public version?: string;
    public request?: Request;
    public responses?: Response[];

    constructor(contract?: OperationContract) {
        this.id = contract.id;
        this.name = contract.name;
        this.description = contract.description;
        this.urlTemplate = contract.urlTemplate;
        this.method = contract.method;
        this.version = contract.version;

        this.templateParameters = contract.templateParameters
            ? contract.templateParameters.map(x => new Parameter(x))
            : [];

        this.request = new Request(contract.request);

        this.responses = contract.responses
            ? contract.responses.map(x => new Response(x))
            : [];
    }
}