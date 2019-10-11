import * as ko from "knockout";
import template from "./productList.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "productList",
    template: template
})
export class ProductListViewModel {    
    public itemStyleView: ko.Observable<string>;

    constructor() {        
        this.itemStyleView = ko.observable();
    }
}