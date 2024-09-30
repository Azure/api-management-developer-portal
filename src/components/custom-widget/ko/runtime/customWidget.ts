import * as ko from "knockout";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Environment } from "@azure/api-management-custom-widgets-tools";
import { iframeAllows, iframeSandboxAllows, iframeSandboxAllowsBrowserSpecific } from "../../../../constants";
import { widgetRuntimeSelector } from "../../constants";
import template from "./customWidget.html";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class CustomWidget {
    public readonly iframeAllows: string = iframeAllows;
    public iframeSandboxAllows: string = iframeSandboxAllows;
    private windowRef = window;

    constructor() {
        this.src = ko.observable();
        this.name = ko.observable();
        this.instanceId = ko.observable();
    }

    @Param()
    public readonly src: ko.Observable<string>;

    @Param()
    public readonly name: ko.Observable<string>;

    @Param()
    public readonly instanceId: ko.Observable<string>;

    @Param()
    public readonly environment: Environment;

    @Param()
    public readonly allowSameOrigin: boolean;

    @OnMounted()
    public async initialize(): Promise<void> {
        if (this.environment === "development") this.windowRef = window.parent.window;

        const iframe = document.getElementsByTagName("iframe")[0];
        const sandboxAttrs = `${iframeSandboxAllows} ${iframeSandboxAllowsBrowserSpecific}`.split(" ");
        if(this.allowSameOrigin) {
            sandboxAttrs.push("allow-same-origin");
        }
        this.iframeSandboxAllows = sandboxAttrs.filter(token=> iframe?.sandbox.supports(token)).join(" ");

        this.propagateHashchange();
        this.windowRef.addEventListener("hashchange", this.propagateHashchange);
    }

    @OnDestroyed()
    public dispose(): void {
        this.windowRef.removeEventListener("hashchange", this.propagateHashchange);
    }

    private propagateHashchange() {
        const srcNew = new URL(this.src());
        srcNew.hash = this.windowRef.location.hash;
        this.src(srcNew.toString());
    }
}
