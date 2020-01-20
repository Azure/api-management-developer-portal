import * as ko from "knockout";
import template from "./userSigninSocial.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "user-signin-social",
    template: template
})
export class UserSigninSocialViewModel {
    public readonly aadConfig: ko.Observable<string>;
    public readonly aadB2CConfig: ko.Observable<string>;

    constructor() {
        this.aadConfig = ko.observable<string>();
        this.aadB2CConfig = ko.observable<string>();
    }
}