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

    constructor() {
        this.config = ko.observable();
        this.styles = ko.observable<StyleModel>();
    }
}