import * as ko from "knockout";
import template from "./operationDetails.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "operationDetails",
    template: template
})
export class OperationDetailsViewModel {
    public readonly config?: ko.Observable<string>;

    constructor() {
        this.config = ko.observable();
    }
}