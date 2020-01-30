import * as ko from "knockout";
import template from "./signup.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "signup",
    template: template
})
export class SignupViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable<string>();
    }
}