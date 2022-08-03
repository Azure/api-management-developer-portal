import * as ko from "knockout";
import template from "./markdown-runtime.html";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { MarkdownSupportService } from "../../../../services/markdownSupportService";
import { MarkdownService } from "../../../../services/markdownService";


@RuntimeComponent({
    selector: "markdown-runtime"
})
@Component({
    selector: "markdown-runtime",
    template: template
})
export class MarkdownRuntime {

    public readonly compiled: ko.Observable<string>;

    constructor(
            private readonly markdownSupportService: MarkdownSupportService,
            private readonly markdownService: MarkdownService
        ) {
        this.compiled = ko.observable();
    }

    @Param()
    public id: string;


    @OnMounted()
    public async initialize(): Promise<void> {
        // Your initialization logic
        if (this.id) {
            this.fetchMarkdownDocumentContent();
        }
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }

    private async fetchMarkdownDocumentContent() {
        let doc = (await this.markdownSupportService.getMarkdownDocument(this.id));
        if (!doc) return;
        this.compiled(this.markdownService.processMarkdown(doc.properties.en_us.content));
    }
}