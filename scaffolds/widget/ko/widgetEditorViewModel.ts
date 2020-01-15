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
    @Param()
    public model: WidgetModel;

    @Event()
    public onChange: (model: WidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // Your initialization logic
    }

    private applyChanges(): void {
        this.onChange(this.model);
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}
