import * as ko from "knockout";
import template from "./signin.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "signin",
    template: template
})
export class SigninViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.runtimeConfig = ko.observable<string>();
        this.styles = ko.observable<StyleModel>();
    }
}