import template from "./bemoNavbarEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
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
    }

    private applyChanges(): void {
        this.onChange(this.model);
    }
}
