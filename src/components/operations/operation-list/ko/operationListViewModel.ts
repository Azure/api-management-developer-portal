import * as ko from "knockout";
import template from "./operationList.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "operationList",
    template: template
})
export class OperationListViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}