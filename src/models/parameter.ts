import { ParameterContract } from "../contracts/parameter";

export class Parameter {
    public name: string;
    public in: string;
    public description: string;
    public type: string;
    public defaultValue: string;
    public values: string[];
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