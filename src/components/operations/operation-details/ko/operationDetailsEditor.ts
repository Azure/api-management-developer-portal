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
    public readonly enableConsole: ko.Observable<boolean>;

    constructor() {
        this.enableConsole = ko.observable();
    }

    @Param()
    public model: OperationDetailsModel;

    @Event()
    public onChange: (model: OperationDetailsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.enableConsole(this.model.enableConsole);
        this.enableConsole.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.enableConsole = this.enableConsole();
        this.onChange(this.model);
    }
}