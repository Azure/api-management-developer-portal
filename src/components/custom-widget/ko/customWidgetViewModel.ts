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
    /**
     * Signals that the widgets' source is being overridden (for local development). Optionally holds URL to overrides' config files.
     */
    public readonly override: ko.Observable<string | boolean>;
    public readonly iframeSandboxAllows: string = iframeSandboxAllows;

    constructor() {
        this.name = ko.observable();
        this.src = ko.observable();
        this.styles = ko.observable();
        this.override = ko.observable();
    }
}
