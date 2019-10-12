import template from "./productApis.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";

@Component({
    selector: "product-apis",
    template: template,
    injectable: "productApis"
})
export class ProductApisViewModel { }