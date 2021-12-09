import * as ko from "knockout";
import template from "./signupSocial.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "signup-social",
    template: template
})
export class SignupSocialViewModel {
    public readonly identityProvider: ko.Observable<boolean>;
    public readonly mode: ko.Observable<string>;

    constructor() {
        this.identityProvider = ko.observable<boolean>();
        this.mode = ko.observable<string>();
    }
}