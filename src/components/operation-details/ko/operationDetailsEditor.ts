import * as ko from "knockout";
import template from "./operationDetailsEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { OperationDetailsModel } from "../operationDetailsModel";

@Component({
    selector: "operation-details-editor",
    template: template,
    injectable: "operationDetailsEditor"
})
export class OperationDetailsEditor {
    constructor() { }

    @Param()
    public model: OperationDetailsModel;

    @Event()
    public onChange: (model: OperationDetailsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }

    private applyChanges(): void {
        // TODO: Implement
        this.onChange(this.model);
    }
}