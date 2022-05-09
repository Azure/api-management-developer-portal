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
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly showNoAadConfigMessage: ko.Computed<boolean>;

    constructor() {
        this.identityProvider = ko.observable<boolean>();
        this.mode = ko.observable<string>();
        this.runtimeConfig = ko.observable<string>();
        this.showNoAadConfigMessage = ko.computed<boolean>(() => !this.identityProvider() && this.mode() !== "publishing"); 
    }
}