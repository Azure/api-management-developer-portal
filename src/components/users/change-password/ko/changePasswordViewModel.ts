import * as ko from "knockout";
import template from "./changePassword.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "change-password",
    template: template,
    injectable: "changePassword"
})
export class ChangePasswordViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}