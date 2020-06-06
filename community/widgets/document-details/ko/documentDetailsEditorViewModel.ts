import * as ko from "knockout";
import template from "./documentDetailsEditorView.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetEditor } from "@paperbits/common/widgets";
import { DocumentDetailsModel } from "../documentDetailsModel";
import { widgetEditorSelector } from "..";


@Component({
    selector: widgetEditorSelector,
    template: template
})
export class DocumentDetailsEditor implements WidgetEditor<DocumentDetailsModel> {
    public readonly fileName: ko.Observable<string>;

    constructor() {
        this.fileName = ko.observable();
    }

    @Param()
    public model: DocumentDetailsModel;

    @Event()
    public onChange: (model: DocumentDetailsModel) => void;

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