import * as ko from "knockout";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { StyleHelper } from "@paperbits/styles";
import { ViewManager } from "@paperbits/common/ui";
import { EventManager, Events } from "@paperbits/common/events";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { iframeSandboxAllows } from "../../../constants";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";
import { widgetEditorSelector } from "..";
import template from "./customWidgetEditorView.html";
import { buildWidgetSource } from "./utils";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class CustomWidgetEditorViewModel implements WidgetEditor<CustomWidgetModel> {
    public readonly sizeStyleConfig: ko.Observable<SizeStylePluginConfig>;
    public readonly customInputValue: ko.Observable<string>;
    public readonly src: ko.Observable<string>;
    /**
     * Signals that the widgets' source is being overridden (for local development). Optionally holds URL to overrides' config files.
     */
    public readonly override: ko.Observable<string | boolean>;
    public readonly iframeSandboxAllows: string = iframeSandboxAllows;
    public readonly instanceId: number;

    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider,
        private readonly blobStorage: MapiBlobStorage,
    ) {
        this.sizeStyleConfig = ko.observable();
        this.customInputValue = ko.observable();
        this.src = ko.observable("");
        this.override = ko.observable();
        this.instanceId = Math.random();
    }

    @Param()
    public model: CustomWidgetModel;

    @Event()
    public onChange: (model: CustomWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.customInputValue(this.model.customInputValue);
        this.updateResponsiveObservables();

        window.addEventListener("message", event => {
            if (typeof event.data === "object" && "customInputValueChangedMSAPIM" in event.data) {
                const {key, value, instanceId} = event.data.customInputValueChangedMSAPIM;
                if (instanceId !== this.instanceId) return;

                const values = JSON.parse(this.customInputValue()).values ?? {};
                values[key] = value;
                this.customInputValue(JSON.stringify({values}));
            }
        });

        this.customInputValue.subscribe(this.applyCustomInputValueChanges);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateResponsiveObservables);

        const environment = await this.settingsProvider.getSetting<string>("environment");
        const widgetSource = await buildWidgetSource(this.blobStorage, this.model, environment, this.instanceId, "editor.html");
        this.src(widgetSource.src);
        this.override(widgetSource.override);
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