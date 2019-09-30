import * as ko from "knockout";
import * as Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-http";
import "prismjs/components/prism-c";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-ruby";
// import "prismjs/components/prism-php"; // broken!

import { TemplatingService } from "../services/templatingService";

interface TemplateConfig {
    template?: string;
    model: Object;
    language: string;
}

ko.bindingHandlers["codesample"] = {
    update: (element: HTMLElement, valueAccessor: () => TemplateConfig): void => {
        const config = valueAccessor();
        const template = ko.unwrap(config.template);
        const language = ko.unwrap(config.language);
        const templateModel = ko.unwrap(config.model);

        const render = async () => {
            const result = await TemplatingService.render(template, ko.toJS(templateModel));

            let highlightLanguage;
            highlightLanguage = "js";

            switch (language) {
                case "csharp":
                    highlightLanguage = "csharp";
                    break;
                case "curl":
                case "http":
                    highlightLanguage = "http";
                    break;
                case "java":
                    highlightLanguage = "java";
                    break;
                case "javascript":
                    highlightLanguage = "js";
                    break;
                case "objc":
                    highlightLanguage = "c";
                    break;
                // case "php":
                //     highlightLanguage = "php";
                //     break;
                case "python":
                    highlightLanguage = "python";
                    break;
                case "ruby":
                case "php":
                    highlightLanguage = "ruby";
                    break;
            }

            const html = Prism.highlight(result, Prism.languages[highlightLanguage], highlightLanguage);

            ko.applyBindingsToNode(element, { html: html }, null);
        };

        render();
    }
};