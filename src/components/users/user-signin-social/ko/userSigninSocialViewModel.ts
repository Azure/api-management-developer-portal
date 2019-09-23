import * as ko from "knockout";
import template from "./userSigninSocial.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";


@Component({
    selector: "user-signin-social",
    template: template,
    injectable: "userSigninSocialViewModel"
})
export class UserSigninSocialViewModel {
    public readonly params: ko.Observable<string>;

    constructor() {
        this.params = ko.observable<string>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
       // TODO
    }
}