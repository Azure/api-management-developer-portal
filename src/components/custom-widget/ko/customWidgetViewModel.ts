import * as ko from "knockout";
import template from "./customWidgetView.html";
import { widgetSelector } from "../constants";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: widgetSelector,
    template: template
})
export class CustomWidgetViewModel {
    public readonly name: ko.Observable<string>;
    public readonly tech: ko.Observable<string>;
    public readonly sourceControl: ko.Observable<string>;

    constructor() {
        this.name = ko.observable();
        this.tech = ko.observable();
        this.sourceControl = ko.observable();
    }
}
