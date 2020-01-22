import * as ko from "knockout";
import template from "./code-sample.html";
import { Component, Param } from "@paperbits/common/ko/decorators";


@Component({
    selector: "code-sample",
    template: template
})
export class CodeSampleViewModel {
    constructor() {
        this.content = ko.observable();
        this.language = ko.observable();
    }

    @Param()
    public readonly content: ko.Observable<string>;

    @Param()
    public readonly language: ko.Observable<string>;
}