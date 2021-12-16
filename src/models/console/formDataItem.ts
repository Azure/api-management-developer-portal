import * as ko from "knockout";
import { RequestBodyType } from "../../constants";

export class FormDataItem {
    public readonly name: ko.Observable<string>;
    public readonly type: ko.Observable<string>;
    public readonly description: ko.Observable<string>;
    public readonly required: ko.Observable<boolean>;

    public readonly body: ko.Observable<string>;
    public readonly contentType: ko.Observable<string>;
    public readonly binary: ko.Observable<File>;
    public readonly bodyFormat: ko.Observable<RequestBodyType>;

    constructor() {
        this.name = ko.observable();
        this.type = ko.observable();
        this.description = ko.observable();
        this.required = ko.observable();

        this.body = ko.observable();
        this.contentType = ko.observable();
        this.binary = ko.observable();
        this.binary.extend(<any>{ maxFileSize: 3 * 1024 * 1024 });        
        this.bodyFormat = ko.observable(RequestBodyType.raw);

        this.onSetValue = this.onSetValue.bind(this);
        this.type.subscribe(this.onSetValue);
    }
    
    private onSetValue(typeValue: any) {
        switch (typeValue) {
            case "file" :
                this.bodyFormat(RequestBodyType.binary);
                break;
            case "object" :
                this.bodyFormat(RequestBodyType.raw);
                break;
            default:
                this.bodyFormat(RequestBodyType.string);            
        }
    }
}
