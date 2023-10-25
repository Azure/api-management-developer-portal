import * as ko from "knockout";
import template from "./productSubscriptions.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "product-subscriptions",
    template: template
})
export class ProductSubscriptionsViewModel {
    public readonly styles: ko.Observable<StyleModel>;
    
    constructor() {
        this.styles = ko.observable<StyleModel>();
    }
}
