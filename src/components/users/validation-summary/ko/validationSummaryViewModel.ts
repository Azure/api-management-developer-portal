import * as ko from "knockout";
import template from "./validationSummary.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "validationSummary",
    template: template
})
export class ValidationSummaryViewModel {
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.styles = ko.observable<StyleModel>();
    }
}