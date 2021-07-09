import * as ko from "knockout";
import { ConsoleParameter } from "./consoleParameter";
import { ConsoleHeader } from "./consoleHeader";
import { ConsoleRepresentation } from "./consoleRepresentation";
import { Request } from "../request";
import { RequestBodyType } from "../../constants";
import { FormDataItem } from "./formDataItem";

export class ConsoleRequest {
    public readonly queryParameters: ko.ObservableArray<ConsoleParameter>;
    public readonly headers: ko.ObservableArray<ConsoleHeader>;
    public readonly meaningfulHeaders: ko.Computed<ConsoleHeader[]>;
    public readonly representations: ConsoleRepresentation[];
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
        this.representations = request.representations.map(representation => new ConsoleRepresentation(representation));
        this.queryParameters = ko.observableArray(request.queryParameters.map(parameter => new ConsoleParameter(parameter)));
        this.headers = ko.observableArray(request.headers.map(header => new ConsoleHeader(header)));
        this.meaningfulHeaders = ko.computed(() => this.headers().filter(x => !!x.value()));

        this.body = ko.observable();
        this.binary = ko.observable();
        this.binary.extend(<any>{ maxFileSize: 3 * 1024 * 1024 });        
        this.bodyFormat = ko.observable(RequestBodyType.raw);
        this.bodyDataItems = ko.observableArray([]);

        if (this.representations?.length === 0) {
            return;
        }

        const representation = this.representations[0];

        this.body(representation.sample);

        this.representationContentType = representation.contentType;

        // do not convert formParameters for contentType = application/x-www-form-urlencoded
        // do not add Content-Type header for multipart/form-data
        const bodyRepresentation = this.representationContentType === "multipart/form-data" && request.representations.find(r => r.formParameters?.length > 0);
        if (bodyRepresentation) {
            this.hasBody = true;
            this.readonlyBodyFormat = true;
            this.bodyFormat(RequestBodyType.form);
            const dataItems = bodyRepresentation.formParameters.map(p => {
                const item = new FormDataItem();
                item.name(p.name);
                item.type(p.type);
                item.description(p.description);
                item.required(p.required);
                return item;
            });
            this.bodyDataItems(dataItems);
        } else {
            if (this.representationContentType && this.headers().find(h => h.name() === "Content-Type") === undefined) {
                const consoleHeader = new ConsoleHeader();
                consoleHeader.name("Content-Type");
                consoleHeader.value(this.representationContentType);
                this.headers.push(consoleHeader);
            }
        }

    }

    public getFormDataPayload(): FormData {
        const formData = new FormData();
        const items = this.bodyDataItems();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.bodyFormat() === RequestBodyType.binary) {
                const file = item.binary();
                if (file) {
                    formData.append(item.name(), file, file.name);
                } else {
                    formData.append(item.name(), "");
                }
                
            } else {
                formData.append(item.name(), item.body() || "");
            }
        }
        return formData;
    }

    public requestHeaders(): ConsoleHeader[] {
        return this.headers().filter(header => !header.readonly);
    }
}