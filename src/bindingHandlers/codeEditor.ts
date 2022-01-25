import * as ko from "knockout";
import loader from "@monaco-editor/loader";
import { HtmlEditorSettings } from "../constants";

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
                if (e.isFlush) {
                    return;
                }

                const value = editor.getValue();
                editorContent(value);
                onChange(value);
            });
        }
        finally {
            editorLoading(false);
        }
    })()
};