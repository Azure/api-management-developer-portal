import * as ko from "knockout";
import template from "./operationList.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "operationList",
    template: template
})
export class OperationListViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.runtimeConfig = ko.observable();
        this.styles = ko.observable<StyleModel>();
    }
}