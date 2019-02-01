import * as ko from "knockout";
//import { ValidateIf, IsNotEmpty } from "class-validator";

export class ConsoleHost {
    public hostname: KnockoutObservable<string>;

    // @ValidateIf(x => x.hostname && x.hostname.indexOf("*") >= 0)
    // @IsNotEmpty({ message: "Wildcard segment is required." })
    public wildcard: KnockoutObservable<string>;

    constructor() {
        this.hostname = ko.observable();
        this.wildcard = ko.observable();
    }
}