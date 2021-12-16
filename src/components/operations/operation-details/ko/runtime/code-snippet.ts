import * as ko from "knockout";
import template from "./code-snippet.html";
import { Component, Param } from "@paperbits/common/ko/decorators";


@Component({
    selector: "code-snippet",
    template: template
})
export class CodeSnippet {
    public readonly label: ko.Computed<string>;

    constructor() {
        this.title = ko.observable();
        this.content = ko.observable();
        this.language = ko.observable();
        this.label = ko.pureComputed(() => this.joinStringParts(this.title(), this.language()));
    }

    @Param()
    public readonly title: ko.Observable<string>;

    @Param()
    public readonly content: ko.Observable<string>;

    @Param()
    public readonly language: ko.Observable<string>;

    private joinStringParts(...parts: string[]): string {
        return parts.filter(x => !!x).join(" - ");
    }
}