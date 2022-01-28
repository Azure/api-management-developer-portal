import * as ko from "knockout";
import { MarkdownService } from "../services/markdownService";

interface MarkdownConfig {
    /**
     * Markdown source.
     */
    source: string;

    /**
     * Maximum length of text before truncation.
     */
    truncateAt: number;
}


ko.bindingHandlers["markdown"] = {
    update: (element: HTMLElement, valueAccessor: () => string | MarkdownConfig): void => {
        const config = ko.unwrap(valueAccessor());
        const htmlObservable = ko.observable();
        const markdownService = new MarkdownService();

        let markdown: string;
        let length: number;

        if (!config) {
            return;
        }

        if (typeof config === "string") {
            markdown = config;
        }
        else {
            markdown = config.source;
            length = config.truncateAt;
        }

        ko.applyBindingsToNode(element, { html: htmlObservable }, null);

        const html = markdownService.processMarkdown(markdown);
        htmlObservable(html);
    }
};