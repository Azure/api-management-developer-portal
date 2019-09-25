import * as ko from "knockout";
import template from "./userReset.html";
import { Component } from "@paperbits/common/ko/decorators";


@Component({
    selector: "userReset",
    template: template
})
export class UserResetViewModel {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }
}