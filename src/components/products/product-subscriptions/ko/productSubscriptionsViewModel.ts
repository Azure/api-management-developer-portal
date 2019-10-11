import template from "./productSubscriptions.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";

@Component({
    selector: "productSubscriptions",
    template: template,
    injectable: "productSubscriptions"
})
export class ProductSubscriptionsViewModel { }
