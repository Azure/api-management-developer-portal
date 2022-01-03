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
    public readonly styles: ko.Observable<StyleModel>;
    public readonly name: ko.Observable<string>;
    public readonly storageUri: ko.Observable<string>;

    constructor() {
        this.name = ko.observable();
        this.storageUri = ko.observable();
        this.styles = ko.observable();
    }
}
