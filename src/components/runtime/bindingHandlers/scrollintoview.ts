import * as ko from "knockout";

ko.bindingHandlers["scrollintoview"] = {
    init: (element: HTMLElement): void => {
        element.parentElement.scrollTop = element.offsetTop;
    }
}