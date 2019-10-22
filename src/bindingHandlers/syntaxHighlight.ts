import * as ko from "knockout";
import * as Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-http";
import "prismjs/components/prism-c";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-markup";
// import "prismjs/components/prism-php"; // broken!


interface SyntaxHighlightConfig {
    code: string;
    language: string;
}

ko.bindingHandlers["syntaxHighlight"] = {
    update: (element: HTMLElement, valueAccessor: () => SyntaxHighlightConfig): void => {
        const config = valueAccessor();
        const code = ko.unwrap(config.code);
        const language = ko.unwrap(config.language);

        const render = async () => {
            let highlightLanguage;

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
                case "xml":
                    highlightLanguage = "xml";
                    break;
                case "json":
                    highlightLanguage = "js";
                    break;
                default:
                    highlightLanguage = "plain";
            }

            if (highlightLanguage === "plain") {
                const text = code;
                ko.applyBindingsToNode(element, { text: text }, null);
            }
            else {
                const html = Prism.highlight(code, Prism.languages[highlightLanguage], highlightLanguage);
                ko.applyBindingsToNode(element, { html: html }, null);
            }
        };

        render();
    }
};