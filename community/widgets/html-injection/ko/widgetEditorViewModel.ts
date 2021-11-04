import * as ko from "knockout";
import template from "./widgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetModel } from "../widgetModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class WidgetEditorViewModel implements WidgetEditor<WidgetModel> {
    public readonly htmlCode: ko.Observable<string>;
    public readonly htmlCodeHeight: ko.Observable<number>;

    constructor() {
        this.htmlCode = ko.observable();
        this.htmlCodeHeight = ko.observable();
    }

    @Param()
    public model: WidgetModel;

    @Event()
    public onChange: (model: WidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.htmlCode(this.model.htmlCode);
        this.htmlCode.subscribe(() => this.applyChanges('htmlCode'));
        this.htmlCodeHeight(this.model.htmlCodeHeight);
        this.htmlCodeHeight.subscribe(() => this.applyChanges('htmlCodeHeight'));
    }

    private applyChanges(key: string): void {
        this.model[key] = this[key]();
        this.onChange(this.model);
    }
}
