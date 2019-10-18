import * as ko from "knockout";
import template from "./changePassword.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "changePassword",
    template: template
})
export class ChangePasswordViewModel {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }
}