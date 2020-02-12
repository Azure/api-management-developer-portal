import * as ko from "knockout";
import { Parameter } from "../parameter";


export class ConsoleParameter {
    public name: ko.Observable<string>;
    public value: ko.Observable<string>;
    public required: boolean;
    public options: string[];
    public type: string;
    public secret: boolean;
    public custom: boolean;
    public inputType: string;
    public canRename: boolean;
    public error: ko.Observable<string>;

    constructor(contract?: Parameter) {
        this.name = ko.observable();
        this.value = ko.observable();
        this.inputType = "text";
        this.required = false;
        this.options = [];
        this.custom = true;
        this.type = "string";
        this.error = ko.observable();

        if (contract) {
            this.custom = false;
            this.name(contract.name);
            this.value(contract.defaultValue);
            this.required = contract.required;
            this.options = contract.values;
            this.type = contract.type;
            this.secret = false;
            this.inputType = this.secret ? "password" : "text";
        }

        this.canRename = !this.required && this.custom;

        this.name.extend(<any>{ required: { message: `Name is required.` } });

        if (this.required) {
            this.value.extend(<any>{ required: { message: `Value is required.` } });
        }
    }
}