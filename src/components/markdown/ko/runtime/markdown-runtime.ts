import * as ko from "knockout";
import template from "./markdown-runtime.html";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";


@RuntimeComponent({
    selector: "markdown-runtime"
})
@Component({
    selector: "markdown-runtime",
    template: template
})
export class MarkdownRuntime {

    constructor() {
        this.compiledContent = ko.observable();
    }

    @Param()
    public compiledContent: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        // Your initialization logic
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}