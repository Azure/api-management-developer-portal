import template from "./widget-runtime.html";
import { Component, RuntimeComponent, OnDestroyed, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { ISettingsProvider } from "@paperbits/common/configuration";
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
    public readonly inheritStyling: ko.Observable<boolean>;

    public readonly htmlStyling: ko.Observable<string>;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
    ) { 
        this.htmlStyling = ko.observable("");
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        if (this.inheritStyling) {
            const environment = await this.settingsProvider.getSetting<string>("environment");
            this.htmlStyling(environment === "development"
                ? "TODO WiP!" // TODO
                : '<link href="/styles/theme.css" rel="stylesheet" type="text/css"><link href="/styles.css" rel="stylesheet" type="text/css">'
            );
        }
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}