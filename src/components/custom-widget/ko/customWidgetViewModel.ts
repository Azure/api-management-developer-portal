import * as ko from "knockout";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";
import { iframeSandboxAllows } from "../../../constants";
import { widgetSelector } from "../constants";
import template from "./customWidgetView.html";

@Component({
    selector: widgetSelector,
    template: template
})
export class CustomWidgetViewModel {
    public readonly styles: ko.Observable<StyleModel>;
    public readonly name: ko.Observable<string>;
    public readonly src: ko.Observable<string>;
    public readonly instanceId: ko.Observable<string>;
    public readonly iframeSandboxAllows: string = iframeSandboxAllows;

    constructor() {
        this.name = ko.observable();
        this.src = ko.observable();
        this.styles = ko.observable();
        this.instanceId = ko.observable();
    }
}
