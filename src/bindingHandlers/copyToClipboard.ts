import * as ko from "knockout";

ko.bindingHandlers["copyToClipboard"] = {
    init: (element: HTMLElement, valueAccessor: () => string): void => {
        const copyToClipboard = () => {
            const placeholder = document.createElement("textarea");
            placeholder.innerText = ko.unwrap(valueAccessor());
            document.body.appendChild(placeholder);

            const range = document.createRange();
            range.selectNode(placeholder);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            document.execCommand("copy");

            selection.removeAllRanges();
            document.body.removeChild(placeholder);
        };

        ko.applyBindingsToNode(element, { click: copyToClipboard }, null);
    }
};