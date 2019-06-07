import * as ko from "knockout";
import template from "./operationListEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { OperationListModel } from "../operationListModel";

@Component({
    selector: "operation-list-editor",
    template: template,
    injectable: "operationListEditor"
})
export class OperationListEditor {
    constructor() { }

    @Param()
    public model: OperationListModel;

    @Event()
    public onChange: (model: OperationListModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }

    private applyChanges(): void {
        // TODO: Implement
        this.onChange(this.model);
    }
}