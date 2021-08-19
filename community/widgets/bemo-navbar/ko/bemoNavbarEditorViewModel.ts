import * as ko from "knockout";
import template from "./bemoNavbarEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event, OnDestroyed } from "@paperbits/common/ko/decorators";
import { BemoNavbarModel } from "../bemoNavbarModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class BemoNavbarEditorViewModel implements WidgetEditor<BemoNavbarModel> {
    @Param()
    public model: BemoNavbarModel;

    @Event()
    public onChange: (model: BemoNavbarModel) => void;

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
