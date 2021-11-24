import * as ko from "knockout";
import template from "./code-editor.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import loader from '@monaco-editor/loader';
import { HtmlEditorSettings } from "../../constants";

@Component({
    selector: "code-editor",
    template: template
})
export class CodeEditor {
    public readonly editorContent: ko.Observable<string>;
    public readonly editorLoading: ko.Observable<boolean>;

    @Param()
    public code: string;

    @Event()
    public onChange: (content: string) => void;

    constructor() {
        this.editorContent = ko.observable<string>();
        this.editorLoading = ko.observable(true);
    }

    @OnMounted()
    public async init(): Promise<void> {
        this.editorContent(this.code);
        this.initMonaco();
    }

    public async initMonaco(): Promise<void> {
        loader.config({ paths: { vs: "/assets/monaco-editor/vs" } });
        try {
            await loader.init();
            const settings: Record<string, unknown> = HtmlEditorSettings.config
            settings.value = this.editorContent() || '';

            this[HtmlEditorSettings.id] = (window as any).monaco.editor.create(document.getElementById(HtmlEditorSettings.id), settings);

            this[HtmlEditorSettings.id].onDidChangeModelContent((e) => {
                if (!e.isFlush) {
                    const value = this[HtmlEditorSettings.id].getValue()
                    this.editorContent(value);
                    this.onChange(value);
                }
            });
        } finally {
            this.editorLoading(false);
        }
    }
}