import { OperationContract } from "../contracts/operation";
import { Parameter } from "./parameter";
import { Request } from "./request";
import { Response } from "./response";
import { Utils } from "../utils";

export class Operation {
    public readonly id: string;
    public readonly name: string;
    public readonly displayName: string;
    public readonly description: string;
    public readonly urlTemplate: string;
    public readonly templateParameters: Parameter[];
    public readonly parameters: Parameter[];
    public readonly method: string;
    public readonly request: Request;
    public readonly responses: Response[];
    public readonly displayUrlTemplate: string;

    public getMeaningfulResponses(): Response[] {
        return this.responses.filter(x => x.isMeaningful());
    }

    constructor(contract?: OperationContract) {
        this.id = contract.id
        this.name = contract.id;
        this.displayName = contract.name;
        this.description = contract.description;
        this.urlTemplate = contract.urlTemplate;
        this.method = contract.method;

        this.templateParameters = contract.templateParameters
            ? contract.templateParameters.map(x => new Parameter("template", x))
            : [];

        this.request = new Request(contract.request);

        this.parameters = this.templateParameters.concat(this.request.queryParameters);

        this.responses = contract.responses
            ? contract.responses.map(x => new Response(x))
            : [];

        let connector = this.urlTemplate.includes("?") ? "&" : "?";

        const optionalQueryParameters = this.request.queryParameters
            .map((parameter, index) => {
                if (index > 0) {
                    connector = "&";
                }
                return `[${connector}${parameter.name}]`;
            })
            .join("");

        this.displayUrlTemplate = `${this.urlTemplate.replace("/*", "")}${optionalQueryParameters}`;
    }
}