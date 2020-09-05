import * as ko from "knockout";

ko.bindingHandlers["scrollintoview"] = {
    init: (element: HTMLElement): void => {
        element.scrollIntoView({ behavior: "smooth", block: "end" });
    }
};