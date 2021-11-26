import * as ko from "knockout";
import template from "./code-editor.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import loader from "@monaco-editor/loader";
import { HtmlEditorSettings } from "../../constants";

ko.bindingHandlers["codeEditor"] = {
    init: (element, valueAccessor) => void (async () => {
        const { editorContent, onChange, editorLoading } = valueAccessor();
        try {
            loader.config({ paths: { vs: "/assets/monaco-editor/vs" } });
            await loader.init();

            const settings: Record<string, unknown> = HtmlEditorSettings.config;
            settings.value = editorContent() || "";

            const editor = (window as any).monaco.editor.create(element, settings);
            editor.onDidChangeModelContent((e) => {
                if (!e.isFlush) {
                    const value = editor.getValue();
                    editorContent(value);
                    onChange(value);
                }
            });
        } finally {
            editorLoading(false);
        }
    })()
};

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
    }
}