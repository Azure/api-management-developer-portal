import * as ko from "knockout";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";
import { widgetSelector } from "../constants";
import template from "./customWidgetView.html";

@Component({
    selector: widgetSelector,
    template: template
})
export class CustomWidgetViewModel {
    public readonly config: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.config = ko.observable();
        this.styles = ko.observable();
    }
}
