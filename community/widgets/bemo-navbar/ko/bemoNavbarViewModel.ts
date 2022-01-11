import * as ko from "knockout";
import { Component } from "@paperbits/common/ko/decorators";
import template from "./bemoNavbarView.html";
import { widgetSelector } from "../constants";
import { BuiltInRoles } from "@paperbits/common/user";

@Component({
    selector: widgetSelector,
    template: template
})
export class BemoNavbarViewModel {
    public readonly runtimeConfig: ko.Observable<string>;
    public roles: ko.ObservableArray<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
        this.roles = ko.observableArray([BuiltInRoles.authenticated.key]);
    }
}