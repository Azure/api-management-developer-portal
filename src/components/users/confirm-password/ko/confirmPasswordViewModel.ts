import * as ko from "knockout";
import template from "./confirmPassword.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "confirmPassword",
    template: template
})
export class ConfirmPasswordViewModel {
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.styles = ko.observable<StyleModel>();
    }
}