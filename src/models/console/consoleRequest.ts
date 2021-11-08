import * as ko from "knockout";
import { ConsoleParameter } from "./consoleParameter";
import { ConsoleHeader } from "./consoleHeader";
import { ConsoleRepresentation } from "./consoleRepresentation";
import { Request } from "../request";
import { RequestBodyType } from "../../constants";
import { FormDataItem } from "./formDataItem";
import { KnownHttpHeaders } from "../knownHttpHeaders";

export class ConsoleRequest {
    public readonly queryParameters: ko.ObservableArray<ConsoleParameter>;
    public readonly headers: ko.ObservableArray<ConsoleHeader>;
    public readonly meaningfulHeaders: ko.Computed<ConsoleHeader[]>;
    public readonly representation: ConsoleRepresentation;
    public readonly description: string;
    public readonly body: ko.Observable<string>;
    public readonly hasBody: boolean;
    public readonly binary: ko.Observable<File>;
    public readonly bodyFormat: ko.Observable<RequestBodyType>;
    public readonly bodyDataItems: ko.ObservableArray<FormDataItem>;
    public readonly representationContentType: string;
    public readonly readonlyBodyFormat: boolean;

    constructor(request: Request) {
        this.description = request.description;
        this.queryParameters = ko.observableArray(request.queryParameters.map(parameter => new ConsoleParameter(parameter)));
        this.headers = ko.observableArray(request.headers.map(header => new ConsoleHeader(header)));
        this.meaningfulHeaders = ko.computed(() => this.headers().filter(x => !!x.value()));

        this.body = ko.observable();
        this.binary = ko.observable();
        this.binary.extend(<any>{ maxFileSize: 3 * 1024 * 1024 });
        this.bodyFormat = ko.observable(RequestBodyType.raw);
        this.bodyDataItems = ko.observableArray([]);

        this.body(this.representation?.sample);

        this.representationContentType = this.representation?.contentType;

        // do not convert formParameters for contentType = application/x-www-form-urlencoded
        // do not add Content-Type header for multipart/form-data
        const bodyRepresentation = this.representationContentType === "multipart/form-data" && request.representations.find(r => r.formParameters?.length > 0);

        if (bodyRepresentation) {
            this.hasBody = true;
            this.readonlyBodyFormat = true;
            this.bodyFormat(RequestBodyType.form);

            const dataItems = bodyRepresentation.formParameters.map(parameter => {
                const item = new FormDataItem();
                item.name(parameter.name);
                item.type(parameter.type);
                item.description(parameter.description);
                item.required(parameter.required);
                return item;
            });
            this.bodyDataItems(dataItems);
        }
        else if (this.representationContentType && this.headers().find(h => h.name() === KnownHttpHeaders.ContentType) === undefined) {
            const consoleHeader = new ConsoleHeader();
            consoleHeader.name(KnownHttpHeaders.ContentType);
            consoleHeader.value(this.representationContentType);
            this.headers.push(consoleHeader);
        }
    }

    public getFormDataPayload(): FormData {
        const formData = new FormData();
        const items = this.bodyDataItems();

        for (const item of items) {
            if (item.bodyFormat() === RequestBodyType.binary) {
                const file = item.binary();

                if (file) {
                    formData.append(item.name(), file, file.name);
                }
                else {
                    formData.append(item.name(), "");
                }
            }
            else {
                formData.append(item.name(), item.body() || "");
            }
        }
        return formData;
    }

    public requestHeaders(): ConsoleHeader[] {
        return this.headers().filter(header => !header.readonly);
    }
}