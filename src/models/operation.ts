import { OperationContract } from "../contracts/operation";
import { Parameter } from "./parameter";
import { Request } from "./request";
import { Response } from "./response";
import { Utils } from "../utils";

export class Operation {
    public id: string;
    public name: string;
    public displayName: string;
    public description: string;
    public urlTemplate: string;
    public templateParameters: Parameter[];
    public parameters: Parameter[];
    public method: string;
    public version?: string;
    public request?: Request;
    public responses?: Response[];
    public displayUrlTemplate: string;

    public getMeaningfulResponses(): Response[] {
        return this.responses.filter(x => x.isMeaningful());
    }

    constructor(contract?: OperationContract) {
        this.id = Utils.getResourceName("apis", contract.id, "shortId");
        this.name = contract.name;
        this.displayName = contract.properties.displayName;
        this.description = contract.properties.description;
        this.urlTemplate = contract.properties.urlTemplate;
        this.method = contract.properties.method;
        this.version = contract.properties.version;

        this.templateParameters = contract.properties.templateParameters
            ? contract.properties.templateParameters.map(x => new Parameter("template", x))
            : [];

        this.request = new Request(contract.properties.request);

        this.parameters = this.templateParameters.concat(this.request.queryParameters);

        this.responses = contract.properties.responses
            ? contract.properties.responses.map(x => new Response(x))
            : [];

        let connector = this.urlTemplate.contains("?") ? "&" : "?";
        
        const optionalQueryParameters = this.request.queryParameters
            .map((parameter, index) => {
                if (index > 0) {
                    connector = "&";
                }
                return `[${connector}${parameter.name}]`;
            })
            .join("");

        this.displayUrlTemplate = `${this.urlTemplate}${optionalQueryParameters}`;
    }
}