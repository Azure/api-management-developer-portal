import template from "./productDetails.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";


@Component({
    template: template,
    selector: "product-details"
})
export class ProductDetailsViewModel {
}