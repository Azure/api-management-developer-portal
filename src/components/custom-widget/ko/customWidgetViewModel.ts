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
    public readonly src: ko.Observable<string>;
    /**
     * Signals that the widgets' source is being overridden (for local development). Optionally holds URL to overrides' config files.
     */
    public readonly override: ko.Observable<string | boolean>;

    constructor() {
        this.name = ko.observable();
        this.src = ko.observable();
        this.styles = ko.observable();
        this.override = ko.observable();
    }
}
