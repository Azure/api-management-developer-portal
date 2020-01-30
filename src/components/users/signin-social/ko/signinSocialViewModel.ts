import * as ko from "knockout";
import template from "./signinSocial.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";


@Component({
    selector: "signin-social",
    template: template
})
export class SigninSocialViewModel {
    public readonly aadConfig: ko.Observable<string>;
    public readonly aadB2CConfig: ko.Observable<string>;
    public readonly aadLabel: ko.Observable<string>;
    public readonly aadB2CLabel: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;
    public readonly roles: ko.ObservableArray<string>;

    constructor() {
        this.aadConfig = ko.observable<string>();
        this.aadB2CConfig = ko.observable<string>();
        this.aadLabel = ko.observable<string>();
        this.aadB2CLabel = ko.observable<string>();
        this.styles = ko.observable<StyleModel>();
        this.roles = ko.observableArray<string>();
    }
}