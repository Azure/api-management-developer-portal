import * as ko from "knockout";
import * as remark from "remark";
import * as html from "remark-html";


ko.bindingHandlers["markdown"] = {
    init: (element: HTMLElement, valueAccessor: () => string): void => {
        const markdown = ko.unwrap(valueAccessor());
        const htmlObservable = ko.observable();

        ko.applyBindingsToNode(element, { html: htmlObservable }, null);

        remark()
            .use(html)
            .process(markdown, (err, file) => {
                htmlObservable(file);
            });
    }
};