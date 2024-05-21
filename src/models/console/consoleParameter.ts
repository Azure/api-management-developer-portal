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
    public inputType: ko.Observable<string>;
    public canRename: boolean;
    public error: ko.Observable<string>;
    public revealed: ko.Observable<boolean>;
    public optionsCaption: string;

    public toggleRevealed(): void {
        this.revealed(!this.revealed());
        this.inputType(this.secret && !this.revealed() ? "password" : "text");
    }

    constructor(contract?: Parameter) {
        this.name = ko.observable(null);
        this.value = ko.observable(null);
        this.inputType = ko.observable("text");
        this.required = false;
        this.options = [];
        this.custom = true;
        this.type = "string";
        this.error = ko.observable();
        this.revealed = ko.observable(false);
        this.optionsCaption = null;

        this.name.extend(<any>{ required: { message: `Name is required.` } });

        if (!contract) {
            return;
        }

        this.custom = false;
        this.name(contract.name);
        this.required = contract.required;
        this.options = contract.values;
        this.type = contract.type;
        this.secret = false;
        this.inputType(this.secret ? "password" : "text");
        this.canRename = !this.required && this.custom;

        if (this.required) {
            this.value.extend(<any>{ required: { message: `Value is required.` } });
        }

        if (!contract.defaultValue) {
            this.optionsCaption = 'Select value...';
        }

        this.value(contract.defaultValue);
    }
}