import template from "./widget-runtime.html";
import { Component, RuntimeComponent, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import * as ko from "knockout";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class WidgetRuntime {
    @Param()
    public readonly htmlCode: ko.Observable<string>;

    @Param()
    public readonly htmlCodeHeight: ko.Observable<number>;

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}