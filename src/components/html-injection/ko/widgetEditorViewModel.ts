import * as ko from "knockout";
import template from "./widgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetModel } from "../widgetModel";
import { widgetEditorSelector } from "..";
import loader from '@monaco-editor/loader';
import { HtmlEditorSettings } from "../../../constants";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class WidgetEditorViewModel implements WidgetEditor<WidgetModel> {
    public readonly htmlCode: ko.Observable<string>;
    public readonly htmlCodeHeight: ko.Observable<number>;
    public readonly editorLoading: ko.Observable<boolean>;

    constructor() {
        this.htmlCode = ko.observable();
        this.htmlCodeHeight = ko.observable();
        this.editorLoading = ko.observable(true);
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
        this.initMonaco();
    }

    private applyChanges(key: string): void {
        this.model[key] = this[key]();
        this.onChange(this.model);
    }

    public async initMonaco() {
        loader.config({ paths: { vs: "/assets/monaco-editor/vs" } });
        loader.init().then(() => {
            const settings: Record<string, unknown> = HtmlEditorSettings.config
            settings.value = this.htmlCode() || '';

            this[HtmlEditorSettings.id] = (window as any).monaco.editor.create(document.getElementById(HtmlEditorSettings.id), settings);

            this[HtmlEditorSettings.id].onDidChangeModelContent((e) => {
                if (!e.isFlush) {
                    this.htmlCode(this[HtmlEditorSettings.id].getValue());
                    this.applyChanges('htmlCode');
                }
            });
        }).finally(() => this.editorLoading(false));
    }
}
