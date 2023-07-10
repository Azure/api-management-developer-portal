import * as ko from "knockout";
import template from "./customHtmlEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { CustomHtmlModel } from "../customHtmlModel";
import { widgetEditorSelector } from "..";
import { StyleHelper } from "@paperbits/styles";
import { ViewManager } from "@paperbits/common/ui";
import { EventManager, Events } from "@paperbits/common/events";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class CustomHtmlEditorViewModel implements WidgetEditor<CustomHtmlModel> {
    public readonly htmlCode: ko.Observable<string>;
    public readonly inheritStyling: ko.Observable<boolean>;
    public readonly sizeStyleConfig: ko.Observable<SizeStylePluginConfig>;

    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager
    ) {
        this.htmlCode = ko.observable();
        this.inheritStyling = ko.observable();
        this.sizeStyleConfig = ko.observable();
    }

    @Param()
    public model: CustomHtmlModel;

    @Event()
    public onChange: (model: CustomHtmlModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.htmlCode(this.model.htmlCode);
        this.inheritStyling(this.model.inheritStyling);
        this.updateResponsiveObservables();

        this.htmlCode.subscribe(this.applyChanges);
        this.inheritStyling.subscribe(this.applyChanges);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateResponsiveObservables);
    }

    private updateResponsiveObservables(): void {
        if (!this.model.styles) {
            return;
        }

        const viewport = this.viewManager.getViewport();
        const sizeStyleConfig = StyleHelper.getPluginConfigForLocalStyles(this.model.styles, "size", viewport);
        this.sizeStyleConfig(sizeStyleConfig);
    }

    private applyChanges(): void {
        this.model.htmlCode = this.htmlCode();
        this.model.inheritStyling = this.inheritStyling();
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