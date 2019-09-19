import * as ko from "knockout";
import template from "./reportsEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ReportsModel } from "../reportsModel";

@Component({
    selector: "reports-editor",
    template: template,
    injectable: "reportsEditor"
})
export class ReportsEditor {
    constructor() { }

    @Param()
    public model: ReportsModel;

    @Event()
    public onChange: (model: ReportsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }

    private applyChanges(): void {
        // TODO: Implement
        this.onChange(this.model);
    }
}