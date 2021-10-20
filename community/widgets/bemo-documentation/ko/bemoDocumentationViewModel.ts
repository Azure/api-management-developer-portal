import * as ko from "knockout";
import template from "./bemoDocumentation.html";
import { Component } from "@paperbits/common/ko/decorators";
import { widgetSelector } from "../constants";

@Component({
    selector: widgetSelector,
    template: template
})
export class BemoDocumentationViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}
