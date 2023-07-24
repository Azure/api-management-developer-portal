import * as ko from "knockout";
import template from "./listOfApis.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "listOfApis",
    template: template
})
export class ListOfApisViewModel {
    public readonly layout: ko.Observable<string>;
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.layout = ko.observable();
        this.runtimeConfig = ko.observable();
        this.styles = ko.observable<StyleModel>();
    }
}