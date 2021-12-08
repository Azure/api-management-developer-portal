import template from "./widget-runtime.html";
import { Component, RuntimeComponent, OnDestroyed, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { widgetRuntimeSelector } from "../../constants";
import * as ko from "knockout";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class HTMLInjectionWidgetRuntime {
    @Param()
    public readonly htmlCode: ko.Observable<string>;

    @Param()
    public readonly htmlCodeSizeStyles: ko.Observable<SizeStylePluginConfig>;

    @Param()
    public readonly htmlStyling: ko.Observable<string>;

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}