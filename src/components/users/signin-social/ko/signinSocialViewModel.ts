import * as ko from "knockout";
import template from "./signinSocial.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";
import { SecurityModel } from "@paperbits/common/security";


@Component({
    selector: "signin-social",
    template: template
})
export class SigninSocialViewModel {
    public readonly aadConfig: ko.Observable<string>;
    public readonly aadB2CConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;
    public readonly security: ko.Observable<SecurityModel>;
    public readonly mode: ko.Observable<string>;
    public readonly showNoAadConfigMessage: ko.Computed<boolean>;

    constructor() {
        this.aadConfig = ko.observable<string>();
        this.aadB2CConfig = ko.observable<string>();
        this.styles = ko.observable<StyleModel>();
        this.security = ko.observable<SecurityModel>();
        this.mode = ko.observable<string>();
        this.showNoAadConfigMessage = ko.computed<boolean>(() => !this.aadConfig() && !this.aadB2CConfig() && this.mode() !== "publishing");
    }
}