import * as ko from "knockout";
import template from "./apiProducts.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";

@Component({
    selector: "api-products",
    template: template
})
export class ApiProductsViewModel {    
    public readonly layout: ko.Observable<string>;
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.layout = ko.observable();
        this.runtimeConfig = ko.observable();
    }
 }