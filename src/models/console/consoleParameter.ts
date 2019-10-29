import * as ko from "knockout";
import { Parameter } from "../parameter";

export class ConsoleParameter {
    public name: string;
    public value: ko.Observable<string>;
    public required: boolean;
    public options: string[];
    public type: string;
    public secret: boolean;
    public custom: boolean;
    public inputType: string;
    public canRename: boolean;

    constructor(contract?: Parameter) {
        this.name = "";
        this.value = ko.observable();
        this.inputType = "text";
        this.required = false;
        this.options = [];
        this.custom = true;
        this.type = "string";

        if (contract) {
            this.custom = false;
            this.name = contract.name;
            this.value(contract.defaultValue);
            this.required = contract.required;
            this.options = contract.values;
            this.type = contract.type;
            this.secret = false;
            this.inputType = this.secret ? "password" : "text";
        }

        this.canRename = !this.required && this.custom;
    }

    public nameIsValid(): boolean {
        return name !== null && name !== "";
    }

    public valueIsValid(): boolean {
        return this.value() !== null && this.value() !== "";
    }
}