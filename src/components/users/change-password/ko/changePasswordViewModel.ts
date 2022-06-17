import * as ko from "knockout";
import template from "./changePassword.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";


@Component({
    selector: "change-password",
    template: template
})
export class ChangePasswordViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public readonly styles: ko.Observable<StyleModel>;

    constructor() {
        this.runtimeConfig = ko.observable();  
        this.styles = ko.observable<StyleModel>();
    }
}