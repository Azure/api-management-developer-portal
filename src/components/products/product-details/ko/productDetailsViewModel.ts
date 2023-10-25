import * as ko from "knockout";
import template from "./productDetails.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";
import { StyleModel } from "@paperbits/common/styles";


@Component({
    template: template,
    selector: "product-details"
})
export class ProductDetailsViewModel {
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.styles = ko.observable<StyleModel>();
    }
}