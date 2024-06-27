import * as ko from "knockout";
import template from "./subscriptions.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "userSubscriptions",
    template: template
})
export class SubscriptionsViewModel {
    public readonly styles: ko.Observable<StyleModel>;
    public readonly isRedesignEnabled: ko.Observable<boolean>;

    constructor() {
        this.styles = ko.observable<StyleModel>();
        this.isRedesignEnabled = ko.observable<boolean>();
    }
}