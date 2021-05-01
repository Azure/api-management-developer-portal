import * as ko from "knockout";

interface TabConfig {
    isSelected: ko.Observable<boolean>;
}

ko.bindingHandlers["tab"] = {
    update: (element: HTMLElement, valueAccessor: () => TabConfig): void => {
        const config = valueAccessor();
        const isSelected = ko.unwrap(config.isSelected);

        ko.applyBindingsToNode(element, {
            css: {
                "nav-link-active": isSelected
            },
            attr: {
                "aria-selected": isSelected ? "true" : "false"
            }
        }, null);
    }
};