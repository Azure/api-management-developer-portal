import * as ko from "knockout";
import template from "./widgetView.html";
import { widgetSelector } from "../constants";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: widgetSelector,
    template: template
})
export class HtmlInjectionViewModel {
    public readonly styles: ko.Observable<StyleModel>;
    public readonly htmlCode: ko.Observable<string>;

    constructor() {
        this.htmlCode = ko.observable();
        this.styles = ko.observable();
    }
}
