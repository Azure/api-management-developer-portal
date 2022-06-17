import * as ko from "knockout";
import template from "./signup.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "signup",
    template: template
})
export class SignupViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.runtimeConfig = ko.observable<string>();
        this.styles = ko.observable<StyleModel>();
    }
}