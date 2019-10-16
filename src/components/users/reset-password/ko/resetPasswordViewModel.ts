import * as ko from "knockout";
import template from "./resetPassword.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "resetPassword",
    template: template
})
export class ResetPasswordViewModel {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }
}