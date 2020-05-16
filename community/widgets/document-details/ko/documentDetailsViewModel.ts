import * as ko from "knockout";
import template from "./documentDetails.html";
import { Component } from "@paperbits/common/ko/decorators";
import { widgetSelector } from "../constants";


@Component({
    selector: widgetSelector,
    template: template
})
export class DocumentDetailsViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}
