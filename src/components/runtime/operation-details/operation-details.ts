import * as ko from "knockout";
import template from "./operation-details.html";
import { Component, Param } from "@paperbits/common/ko/decorators";
import { Operation } from "../../../models/operation";

@Component({
    selector: "operation-details",
    template: template,
    injectable: "operationDetails"
})
export class OperationDetails {
    @Param()
    public operation: KnockoutObservable<Operation>;

    constructor() {
        this.operation = ko.observable();
    }
}