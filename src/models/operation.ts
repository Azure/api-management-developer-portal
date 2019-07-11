import { OperationContract } from "../contracts/operation";
import { Parameter } from "./parameter";
import { Request } from "./request";
import { Response } from "./response";
import { Utils } from "../utils";

export class Operation {
    public id: string;
    public shortId: string;
    public name: string;
    public description: string;
    public urlTemplate: string;
    public templateParameters: Parameter[];
    public method: string;
    public version?: string;
    public request?: Request;
    public responses?: Response[];

    constructor(contract?: OperationContract) {
        this.id = Utils.getResourceName("apis", contract.id, "shortId");
        this.shortId = contract.name;
        this.name = contract.properties.displayName;
        this.description = contract.properties.description;
        this.urlTemplate = contract.properties.urlTemplate;
        this.method = contract.properties.method;
        this.version = contract.properties.version;

        this.templateParameters = contract.properties.templateParameters
            ? contract.properties.templateParameters.map(x => new Parameter(x))
            : [];

        this.request = new Request(contract.properties.request);

        this.responses = contract.properties.responses
            ? contract.properties.responses.map(x => new Response(x))
            : [];
    }
}