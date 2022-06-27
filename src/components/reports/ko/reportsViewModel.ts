import * as ko from "knockout";
import template from "./reports.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "reports",
    template: template
})
export class ReportsViewModel {
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.styles = ko.observable<StyleModel>();
    }
}