import * as ko from "knockout";
import template from "./historyOfApi.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "historyOfApi",
    template: template
})
export class HistoryOfApiViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}