import * as ko from "knockout";
import template from "./productSubscribe.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "product-subscribe",
    template: template
})
export class ProductSubscribeViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.runtimeConfig = ko.observable();
        this.styles = ko.observable<StyleModel>();
    }
}