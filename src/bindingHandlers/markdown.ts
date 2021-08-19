import * as ko from "knockout";
import * as remark from "remark";
import * as html from "remark-html";
import * as truncateHtml from "truncate-html";

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

        remark()
            .use(html)
            .process(markdown, (err: any, html: any) => {
                html = truncateHtml.default(html, { length: length, reserveLastWord: true });
                htmlObservable(html);
            });
    }
};