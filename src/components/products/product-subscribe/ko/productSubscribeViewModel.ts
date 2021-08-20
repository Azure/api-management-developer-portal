import * as ko from "knockout";
import template from "./productSubscribe.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";

@Component({
    selector: "product-subscribe",
    template: template
})
export class ProductSubscribeViewModel {
	public readonly runtimeConfig: ko.Observable<string>;

	constructor() {        
        this.runtimeConfig = ko.observable();
    }
	
}