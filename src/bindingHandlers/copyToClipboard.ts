import * as ko from "knockout";

ko.bindingHandlers["copyToClipboard"] = {
    init: (element: HTMLElement, valueAccessor: () => (string | (() => Promise<string>))): void => {
        const copyToClipboard = async () => {
            const placeholder = document.createElement("textarea");
            const unwrappedValue = ko.unwrap(valueAccessor());
            placeholder.innerText = typeof unwrappedValue === 'string'
                ? unwrappedValue as string
                : await (unwrappedValue as (() => Promise<string>))();
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