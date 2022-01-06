import * as ko from "knockout";
import template from "./code-editor.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";

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