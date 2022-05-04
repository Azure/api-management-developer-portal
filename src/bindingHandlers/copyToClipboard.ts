import * as ko from "knockout";

ko.bindingHandlers["copyToClipboard"] = {
    init: (element: HTMLElement, valueAccessor: () => (string | (() => Promise<string>))): void => {
        const copyToClipboard = async () => {
            const unwrappedValue = ko.unwrap(valueAccessor());
            const text = typeof unwrappedValue === "string"
                ? unwrappedValue as string
                : await (unwrappedValue as (() => Promise<string>))();

            await navigator.clipboard.writeText(text);
        };

        ko.applyBindingsToNode(element, { click: copyToClipboard }, null);
    }
};