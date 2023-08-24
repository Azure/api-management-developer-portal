import * as ko from "knockout";
import template from "./productApis.html";
import { Component } from "@paperbits/common/ko/decorators/component.decorator";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "product-apis",
    template: template
})
export class ProductApisViewModel {
    public readonly layout: ko.Observable<string>;
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.layout = ko.observable();
        this.runtimeConfig = ko.observable();
        this.styles = ko.observable<StyleModel>();
    }
}