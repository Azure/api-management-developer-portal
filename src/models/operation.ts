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
    public readonly version: string;
    public readonly request: Request;
    public readonly responses: Response[];
    public readonly displayUrlTemplate: string;

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