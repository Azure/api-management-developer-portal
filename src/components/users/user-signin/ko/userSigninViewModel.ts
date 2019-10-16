import * as ko from "knockout";
import template from "./userSignin.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "userSignin",
    template: template
})
export class UserSigninViewModel {
    public readonly delegationConfig: ko.Observable<string>;

    constructor() {
        this.delegationConfig = ko.observable<string>();
    }
}