import * as ko from "knockout";
import template from "./widgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event, OnDestroyed } from "@paperbits/common/ko/decorators";
import { WidgetModel } from "../widgetModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class WidgetEditorViewModel implements WidgetEditor<WidgetModel> {
    public readonly sessionNumber: ko.Observable<string>;

    constructor() {
        this.sessionNumber = ko.observable();
    }

    @Param()
    public model: WidgetModel;

    @Event()
    public onChange: (model: WidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.sessionNumber(this.model.sessionNumber);
        this.sessionNumber.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.sessionNumber = this.sessionNumber();
        this.onChange(this.model);
    }
}
