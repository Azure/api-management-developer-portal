import * as ko from "knockout";
import template from "./signin.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "signin",
    template: template
})
export class SigninViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable<string>();
    }
}