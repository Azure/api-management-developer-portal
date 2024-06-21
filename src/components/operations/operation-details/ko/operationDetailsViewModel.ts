import * as ko from "knockout";
import template from "./operationDetails.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "operationDetails",
    template: template
})
export class OperationDetailsViewModel {
    public readonly config?: ko.Observable<string>;    
    public readonly styles: ko.Observable<StyleModel>;
    public readonly isRedesignEnabled: ko.Observable<boolean>;

    constructor() {
        this.config = ko.observable();
        this.styles = ko.observable<StyleModel>();
        this.isRedesignEnabled = ko.observable<boolean>();
    }
}