import * as ko from "knockout";
import template from "./validation-summary.html";
import { Component, OnMounted, RuntimeComponent} from "@paperbits/common/ko/decorators";
import { IEventManager } from "@paperbits/common/events/IEventManager";
import { Bag } from "@paperbits/common";

@RuntimeComponent({ selector: "validation-summary" })
@Component({
    selector: "validation-summary",
    template: template,
    injectable: "validation-summary"
})

export class ValidationSummary {
    public readonly errorMsgs: ko.ObservableArray<string>;
    public hasErrors: ko.Observable<Boolean>;
    private errorGroups: Bag<string[]>;

    constructor(private readonly eventManager: IEventManager) {
        this.errorMsgs = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
        this.errorGroups = {};
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.eventManager.addEventListener("validationsummary", this.showValidationSummary.bind(this));
    }

    private showValidationSummary(event: CustomEvent): void {
        this.errorGroups[event.detail.from] = event.detail.msgs;
        var errSum = [];
        Object.values(this.errorGroups).forEach(function(curGroup) {
            curGroup.forEach(x => {
                errSum.push(x);
            })
        });
        this.errorMsgs(errSum);
        if (this.errorMsgs().length > 0) {
            this.hasErrors(true);
        } else { 
            this.hasErrors(false);
        }
    }
}

