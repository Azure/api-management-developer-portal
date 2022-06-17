import * as ko from "knockout";
import template from "./profile.html";
import { Component } from "@paperbits/common/ko/decorators";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "profile",
    template: template
})
export class ProfileViewModel {
    public readonly styles: ko.Observable<StyleModel>;
    
    constructor() {
        this.styles = ko.observable<StyleModel>();
    }

}