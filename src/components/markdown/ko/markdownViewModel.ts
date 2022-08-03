import * as ko from "knockout";
import template from "./markdown.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "markdown",
    template: template
})
export class MarkdownViewModel {

    public readonly runtimeConfig: ko.Observable<string>;
    public readonly id: ko.Observable<string>;
    constructor() {   
        this.runtimeConfig = ko.observable();
        this.id = ko.observable();
    }
}