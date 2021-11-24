import * as ko from "knockout";
import template from "./widgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { HTMLInjectionWidgetModel } from "../widgetModel";
import { widgetEditorSelector } from "..";
import loader from '@monaco-editor/loader';
import { HtmlEditorSettings } from "../../../constants";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class WidgetEditorViewModel implements WidgetEditor<HTMLInjectionWidgetModel> {
    public readonly htmlCode: ko.Observable<string>;
    public readonly htmlCodeSizeStyles: ko.Observable<SizeStylePluginConfig>;
    public readonly editorLoading: ko.Observable<boolean>;

    constructor() {
        this.htmlCode = ko.observable();
        this.htmlCodeSizeStyles = ko.observable();
        this.editorLoading = ko.observable(true);
    }

    @Param()
    public model: HTMLInjectionWidgetModel;

    @Event()
    public onChange: (model: HTMLInjectionWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.htmlCode(this.model.htmlCode);
        this.htmlCode.subscribe(() => this.applyChanges('htmlCode'));
        this.htmlCodeSizeStyles(this.model.htmlCodeSizeStyles);
        this.htmlCodeSizeStyles.subscribe(() => this.applyChanges('htmlCodeSizeStyles'));
        this.initMonaco();
    }

    private applyChanges(key: string): void {
        this.model[key] = this[key]();
        this.onChange(this.model);
    }

    public async initMonaco(): Promise<void> {
        loader.config({ paths: { vs: "/assets/monaco-editor/vs" } });
        try {
            await loader.init();
            const settings: Record<string, unknown> = HtmlEditorSettings.config
            settings.value = this.htmlCode() || '';

            this[HtmlEditorSettings.id] = (window as any).monaco.editor.create(document.getElementById(HtmlEditorSettings.id), settings);

            this[HtmlEditorSettings.id].onDidChangeModelContent((e) => {
                if (!e.isFlush) {
                    this.htmlCode(this[HtmlEditorSettings.id].getValue());
                    this.applyChanges('htmlCode');
                }
            });
        } finally {
            this.editorLoading(false);
        }
    }

    public onContainerSizeUpdate(htmlCodeSizeStyles: SizeStylePluginConfig): void {
        this.htmlCodeSizeStyles(htmlCodeSizeStyles);
    }
}
