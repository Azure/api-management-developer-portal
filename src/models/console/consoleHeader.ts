import * as ko from "knockout";
// import { KnownHttpHeaders } from "../knownHttpHeaders";
// import { IsNotEmpty, ValidateIf } from "class-validator";
import { Parameter } from "../parameter";

export class ConsoleHeader {
    // @IsNotEmpty({ message: "Header name cannot be empty" })
    public name: ko.Observable<string>;

    // @IsNotEmpty({ message: "Header value cannot be empty" })
    // @ValidateIf(x => x.required)
    public value: ko.Observable<string>;

    public inputTypeValue: string;
    public required: boolean;
    public readonly: boolean;
    public secret: boolean;
    public revealed: boolean;
    public options: string[];
    public custom: boolean;
    public description: string;
    public type: string;

    public toggleRevealed(): void {
        this.revealed = !this.revealed;
        this.inputTypeValue = this.secret && !this.revealed ? "password" : "text";
    }

    public canRename(): boolean {
        return !this.required && this.custom;
    }

    public names() {
        // var keys = Object.keys(KnownHttpHeaders);
        // var values = keys.map((value) => { return KnownHttpHeaders[value]; });
        // return values;
    }

    constructor(contract?: Parameter) {
        this.name = ko.observable();
        this.value = ko.observable();
        this.inputTypeValue = "text";
        this.revealed = false;
        this.options = [];
        this.required = false;
        this.readonly = false;
        this.custom = true;
        this.type = "string";
        this.description = "Additional header.";

        if (contract) {
            this.custom = false;
            this.name(contract.name);
            this.value(contract.defaultValue);
            this.required = contract.required;
            this.options = contract.values;
            this.description = contract.description ? contract.description : "";
            this.type = contract.type;
            this.secret = false;
            this.inputTypeValue = this.secret && !this.revealed ? "password" : "text";
        }
    }

    public toHeader(): Parameter {
        let header = new Parameter({
            name: this.name(),
            defaultValue: this.value(),
            description: this.description,
            type: this.type,
            required: this.required
        });
        return header;
    }

    public toggleSecret(): void {
        this.revealed = !this.revealed;
        this.inputTypeValue = this.secret && !this.revealed ? "password" : "text";
    }
}