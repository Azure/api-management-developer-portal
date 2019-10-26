import * as ko from "knockout";
import template from "./listOfApis.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "listOfApis",
    template: template
})
export class ListOfApisViewModel {
    public readonly layout: ko.Observable<string>;
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {        
        this.layout = ko.observable();
        this.runtimeConfig = ko.observable();
    }
}