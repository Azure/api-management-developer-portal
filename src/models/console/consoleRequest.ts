import * as ko from "knockout";
import { ConsoleParameter } from "./consoleParameter";
import { ConsoleHeader } from "./consoleHeader";
import { ConsoleRepresentation } from "./consoleRepresentation";
// import { ValidateNested } from "class-validator";
import { Request } from "../request";


export class ConsoleRequest {
    public queryParameters: ko.ObservableArray<ConsoleParameter>;
    public headers: ko.ObservableArray<ConsoleHeader>;
    public representations: ConsoleRepresentation[];
    public description: string;
    public body: ko.Observable<string>;
    public binary: File;
    public bodyFormat: string;

    constructor(request: Request) {
        this.description = request.description;
        this.representations = request.representations.map(representation => new ConsoleRepresentation(representation));
        this.queryParameters = ko.observableArray(request.queryParameters.map(parameter => new ConsoleParameter(parameter)));
        this.headers = ko.observableArray(request.headers.map(header => new ConsoleHeader(header)));
        this.body = ko.observable();
        this.bodyFormat = "raw";

        if (this.representations && this.representations.length > 0) {
            this.body(this.representations[0].sample);

            const contentType = this.representations[0].contentType;

            if (contentType && this.headers().find(h => h.name() === "Content-Type") === undefined) {
                const consoleHeader = new ConsoleHeader();
                consoleHeader.name("Content-Type");
                consoleHeader.value(contentType);
                this.headers.push(consoleHeader);
            }
        }
    }

    public requestHeaders(): ConsoleHeader[] {
        return this.headers().filter(header => !header.readonly);
    }
}