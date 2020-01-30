import * as ko from "knockout";
import template from "./validation-summary.html";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { EventManager } from "@paperbits/common/events";
import { Bag } from "@paperbits/common";
import { ValidationReport } from "../../../../../contracts/validationReport";

@RuntimeComponent({
    selector: "validation-summary"
})
@Component({
    selector: "validation-summary",
    template: template
})

export class ValidationSummary {
    public readonly errorMsgs: ko.ObservableArray<string>;
    public hasErrors: ko.Observable<Boolean>;
    private errorGroups: Bag<string[]>;

    constructor(private readonly eventManager: EventManager) {
        this.errorMsgs = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
        this.errorGroups = {};
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.eventManager.addEventListener("onValidationErrors", this.showValidationSummary.bind(this));
    }

    private showValidationSummary(event: ValidationReport): void {
        this.errorGroups[event.source] = event.errors;
        var errSum = [];
        Object.values(this.errorGroups).forEach(function (curGroup) {
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

