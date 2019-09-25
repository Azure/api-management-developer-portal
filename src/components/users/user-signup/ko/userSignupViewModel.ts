import * as ko from "knockout";
import template from "./userSignup.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "userSignup",
    template: template
})
export class UserSignupViewModel {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }
}