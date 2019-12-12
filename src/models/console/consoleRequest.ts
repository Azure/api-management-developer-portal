import * as ko from "knockout";
import { ConsoleParameter } from "./consoleParameter";
import { ConsoleHeader } from "./consoleHeader";
import { ConsoleRepresentation } from "./consoleRepresentation";
import { Request } from "../request";


export class ConsoleRequest {
    public readonly queryParameters: ko.ObservableArray<ConsoleParameter>;
    public readonly headers: ko.ObservableArray<ConsoleHeader>;
    public readonly meaningfulHeaders: ko.Computed<ConsoleHeader[]>;
    public readonly representations: ConsoleRepresentation[];
    public readonly description: string;
    public readonly body: ko.Observable<string>;
    public readonly binary: File;
    public readonly bodyFormat: string;

    constructor(request: Request) {
        this.description = request.description;
        this.representations = request.representations.map(representation => new ConsoleRepresentation(representation));
        this.queryParameters = ko.observableArray(request.queryParameters.map(parameter => new ConsoleParameter(parameter)));
        this.headers = ko.observableArray(request.headers.map(header => new ConsoleHeader(header)));
        this.body = ko.observable();
        this.bodyFormat = "raw";
        this.meaningfulHeaders = ko.computed(() => this.headers().filter(x => !!x.value()));

        if (this.representations?.length === 0) {
            return;
        }

        const representation = this.representations[0];

        this.body(representation.sample);

        const contentType = representation.contentType;

        if (contentType && this.headers().find(h => h.name() === "Content-Type") === undefined) {
            const consoleHeader = new ConsoleHeader();
            consoleHeader.name("Content-Type");
            consoleHeader.value(contentType);
            this.headers.push(consoleHeader);
        }
    }

    public requestHeaders(): ConsoleHeader[] {
        return this.headers().filter(header => !header.readonly);
    }
}