import * as ko from "knockout";
import template from "./productList.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "product-list",
    template: template
})
export class ProductListViewModel {    
    public readonly layout: ko.Observable<string>;
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {        
        this.layout = ko.observable();
        this.runtimeConfig = ko.observable();
    }
}