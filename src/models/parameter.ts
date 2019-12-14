import { ParameterContract } from "../contracts/parameter";

export class Parameter {
    /**
     * Parameter name, e.g. api-version.
     */
    public name: string;

    /**
     * Parameter description.
     */
    public description: string;

    /**
     * Parameter placement, e.g. "query", "template", "header", "body".
     */
    public in: string;

    /**
     * Parameter type, e.g. "string", "int64", etc.
     */
    public type: string;

    /**
     * Parameter default value, e.g. "2018-06-01-preview".
     */
    public defaultValue: string;

    /**
     * Parameter value suggestions, e.g. ["2016-07-07","2016-10-10", "2018-06-01-preview"]
     */
    public values: string[];

    /**
     * Indicates if the parameter is required to make a request.
     */
    public required: boolean;

    constructor(placement: string, contract?: ParameterContract) {
        this.name = contract.name;
        this.description = contract.description;
        this.type = contract.type;
        this.defaultValue = contract.defaultValue;
        this.values = contract.values;
        this.required = !!contract.required;
        this.in = placement;
    }
}