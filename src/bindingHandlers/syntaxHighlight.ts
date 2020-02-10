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
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
// import "prismjs/components/prism-php"; // broken!


interface SyntaxHighlightConfig {
    code: string;
    language: string;
}

ko.bindingHandlers["syntaxHighlight"] = {
    update: (element: HTMLElement, valueAccessor: () => SyntaxHighlightConfig): void => {
        const config = valueAccessor();
        let code = ko.unwrap(config.code);
        const language = ko.unwrap(config.language);

        const render = async () => {
            let highlightLanguage;

            switch (language) {
                case "csharp":
                    highlightLanguage = "csharp";
                    break;
                case "curl":
                    highlightLanguage = "bash";
                    break;
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
                case "php":
                    // highlightLanguage = "php"; // broken!
                    highlightLanguage = "ruby";
                    break;
                case "python":
                    highlightLanguage = "python";
                    break;
                case "ruby":
                    highlightLanguage = "ruby";
                    break;
                case "xml":
                    highlightLanguage = "xml";
                    break;
                case "json":
                    highlightLanguage = "json";
                    break;
                default:
                    highlightLanguage = "plain";
            }

            if (highlightLanguage === "plain") {
                const text = code;
                ko.applyBindingsToNode(element, { text: text }, null);
            }
            else {

                code = code.replaceAll("/", "fwdslsh"); // workaround for PrismJS bug.
                let html = Prism.highlight(code, Prism.languages[highlightLanguage], highlightLanguage);
                html = html.replaceAll("fwdslsh", "/");

                // const html = Prism.highlight(code, Prism.languages[highlightLanguage], highlightLanguage);
                ko.applyBindingsToNode(element, { html: html }, null);
            }
        };

        render();
    }
};