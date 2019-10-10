import * as ko from "knockout";

ko.bindingHandlers["delayedInput"] = {
    init: (element: HTMLElement, valueAccessor: () => ko.Observable<string>): void => {
        const inputObservable: ko.Observable = valueAccessor();

        let timeout;

        const scheduleUpdate = (value: string) => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                inputObservable(value);
            }, 600);
        };

        const observable = ko.observable();
        observable.subscribe(scheduleUpdate)

        ko.applyBindingsToNode(element, {
            textInput: observable
        }, null);
    }
};