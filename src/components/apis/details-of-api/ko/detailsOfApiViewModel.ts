import * as ko from "knockout";
import template from "./detailsOfApi.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "detailsOfApi",
    template: template
})
export class DetailsOfApiViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}