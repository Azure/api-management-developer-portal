import * as ko from "knockout";
import template from "./resetPassword.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "reset-password",
    template: template
})
export class ResetPasswordViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly isRedesignEnabled: ko.Observable<boolean>;

    constructor() {
        this.runtimeConfig = ko.observable();
        this.isRedesignEnabled = ko.observable<boolean>();
    }
}