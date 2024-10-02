import * as ko from "knockout";
import { Environment } from "@azure/api-management-custom-widgets-tools";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { StyleHelper } from "@paperbits/styles";
import { ViewManager } from "@paperbits/common/ui";
import { EventManager, Events } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { iframeAllows, iframeSandboxAllows } from "../../../constants";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";
import { widgetEditorSelector } from "..";
import template from "./customWidgetEditorView.html";
import { buildWidgetSource } from "./utils";

@Component({
    selector: widgetEditorSelector,
    template: template,
})
export class CustomWidgetEditorViewModel implements WidgetEditor<CustomWidgetModel> {
    public readonly sizeStyleConfig: ko.Observable<SizeStylePluginConfig>;
    public readonly customInputValue: ko.Observable<string>;
    public readonly src: ko.Observable<string>;
    public readonly instanceId: ko.Observable<string>;
    public readonly iframeAllows: string = iframeAllows;
    public readonly iframeSandboxAllows: string = CustomWidgetEditorViewModel.buildSandboxParams();
    public readonly allowSameOrigin: ko.Observable<boolean>;

    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider,
        private readonly blobStorage: MapiBlobStorage,
    ) {
        this.sizeStyleConfig = ko.observable();
        this.customInputValue = ko.observable();
        this.src = ko.observable("");
        this.allowSameOrigin = ko.observable();
        this.instanceId = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Event()
    public onChange: (model: CustomWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.customInputValue(this.model.customInputValue);
        this.instanceId(this.model.instanceId);
        this.updateResponsiveObservables();
        this.allowSameOrigin(this.model.allowSameOrigin || false);

        window.addEventListener("message", event => {
            if (typeof event.data === "object" && "customInputValueChangedMSAPIM" in event.data) {
                const {key, value, instanceId} = event.data.customInputValueChangedMSAPIM;
                if (instanceId !== this.model.instanceId) return;

                const values = JSON.parse(this.customInputValue()).values ?? {};
                values[key] = value;
                this.customInputValue(JSON.stringify({values}));
            }
        });
        this.allowSameOrigin.subscribe(this.applyChanges);
        this.customInputValue.subscribe(this.applyCustomInputValueChanges);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateResponsiveObservables);

        const environment = await this.settingsProvider.getSetting<string>("environment") as Environment;
        const widgetSource = await buildWidgetSource(this.blobStorage, this.model, environment, "editor.html");
        this.src(widgetSource.src);
    }

    private static buildSandboxParams() {
        return iframeSandboxAllows + " allow-same-origin";
    }

    private updateResponsiveObservables(): void {
        if (!this.model.styles) {
            return;
        }

        const viewport = this.viewManager.getViewport();
        const sizeStyleConfig = StyleHelper.getPluginConfigForLocalStyles(this.model.styles, "size", viewport);
        this.sizeStyleConfig(sizeStyleConfig);
    }

    private debounceTimeoutId: number | undefined;
    private applyCustomInputValueChanges(): void {
        clearTimeout(this.debounceTimeoutId);
        if (this.debounceTimeoutId) {
            this.debounceTimeoutId = window.setTimeout(() => {
                this.applyChanges();
                this.debounceTimeoutId = undefined;
            }, 500);
        } else {
            // leading edge
            this.applyChanges();
            this.debounceTimeoutId = window.setTimeout(() => {
                this.debounceTimeoutId = undefined;
            }, 500);
        }
    }

    private applyChanges(): void {
        this.model.customInputValue = this.customInputValue();
        this.model.allowSameOrigin = this.allowSameOrigin();
        this.onChange(this.model);
    }

    /**
     * Updates widget sizing styles.
     */
    public onSizeUpdate(sizeStyles: SizeStylePluginConfig): void {
        const viewport = this.viewManager.getViewport();
        StyleHelper.setPluginConfigForLocalStyles(this.model.styles, "size", sizeStyles, viewport);
        this.onChange(this.model);
    }
}