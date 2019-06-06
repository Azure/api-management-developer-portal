import * as ko from "knockout";
import template from "./listOfApis.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "listOfApis",
    template: template
})
export class ListOfApisViewModel {
    public itemStyleView: ko.Observable<string>;

    constructor() {        
        this.itemStyleView = ko.observable();
    }
}