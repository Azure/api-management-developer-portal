import * as ko from "knockout";
import template from "./widgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { HTMLInjectionWidgetModel } from "../widgetModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class WidgetEditorViewModel implements WidgetEditor<HTMLInjectionWidgetModel> {
    public readonly htmlCode: ko.Observable<string>;
    public readonly htmlCodeSizeStyles: ko.Observable<SizeStylePluginConfig>;
    public readonly inheritStyling: ko.Observable<boolean>;

    constructor() {
        this.htmlCode = ko.observable();
        this.htmlCodeSizeStyles = ko.observable();
        this.inheritStyling = ko.observable();
    }

    @Param()
    public model: HTMLInjectionWidgetModel;

    @Event()
    public onChange: (model: HTMLInjectionWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.htmlCode(this.model.htmlCode);
        this.htmlCode.subscribe(() => this.applyChanges("htmlCode"));
        this.htmlCodeSizeStyles(this.model.htmlCodeSizeStyles);
        this.htmlCodeSizeStyles.subscribe(() => this.applyChanges("htmlCodeSizeStyles"));
        this.inheritStyling(this.model.inheritStyling);
        this.inheritStyling.subscribe(() => this.applyChanges("inheritStyling"));
    }

    private applyChanges(key: string): void {
        this.model[key] = this[key]();
        this.onChange(this.model);
    }
}