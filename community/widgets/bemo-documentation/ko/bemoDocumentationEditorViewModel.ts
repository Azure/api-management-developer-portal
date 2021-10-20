import * as ko from "knockout";
import template from "./bemoDocumentationEditorView.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetEditor } from "@paperbits/common/widgets";
import { BemoDocumentationModel } from "../bemoDocumentationModel";
import { widgetEditorSelector } from "..";


@Component({
    selector: widgetEditorSelector,
    template: template
})
export class BemoDocumentationEditor implements WidgetEditor<BemoDocumentationModel> {
    public readonly fileName: ko.Observable<string>;

    constructor() {
        this.fileName = ko.observable();
    }

    @Param()
    public model: BemoDocumentationModel;

    @Event()
    public onChange: (model: BemoDocumentationModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.fileName(this.model.fileName);
        this.fileName.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.fileName = this.fileName();
        this.onChange(this.model);
    }
}