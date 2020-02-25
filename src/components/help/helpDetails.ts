import * as ko from "knockout";
import template from "./helpDetails.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { Hint } from "./hint";

@Component({
    selector: "help-details-workshop",
    template: template
})
export class HelpDetailsWorkshop {
    public readonly hints: ko.ObservableArray<Hint>;

    public constructor() {
        this.hints = ko.observableArray();
    }

    @Param()
    public hint: Hint;

    @OnMounted()
    public async initialize(): Promise<void> {
        //
    }
}
