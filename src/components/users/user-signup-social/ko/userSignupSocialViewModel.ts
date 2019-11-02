import * as ko from "knockout";
import template from "./userSignupSocial.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "user-signup-social",
    template: template,
    injectable: "userSignupSocial"
})
export class UserSignupSocialViewModel {

    constructor() {
    }
}