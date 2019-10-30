import * as ko from "knockout";
import template from "./resetPassword.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "reset-password",
    template: template,
    injectable: "resetPassword"
})
export class ResetPasswordViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}