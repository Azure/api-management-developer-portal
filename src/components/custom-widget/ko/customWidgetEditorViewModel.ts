import * as ko from "knockout";
import { saveAs } from "file-saver";
import { scaffold } from "scaffold";
import { TControl, TTech } from "scaffold/scaffold";
import template from "./customWidgetEditorView.html";
import { IWidgetService, WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { CustomWidgetHandlers } from "../../custom-widget-scaffold";
import { CustomWidgetModel } from "../customWidgetModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class CustomWidgetEditorViewModel implements WidgetEditor<CustomWidgetModel> {
    public readonly name: ko.Observable<string>;
    public readonly tech: ko.Observable<TTech | null>;
    public readonly sourceControl: ko.Observable<TControl>;

    constructor(private readonly widgetService: IWidgetService) {
        this.name = ko.observable();
        this.tech = ko.observable();
        this.sourceControl = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Event()
    public onChange: (model: CustomWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.name(this.model.name);
        this.tech(this.model.tech);
        this.sourceControl(this.model.sourceControl);

        this.name.subscribe(this.applyChanges);
        this.tech.subscribe(this.applyChanges);
        this.sourceControl.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.name = this.name();
        this.model.tech = this.tech();
        this.model.sourceControl = this.sourceControl();
        this.onChange(this.model);
    }

    public downloadScaffold(): void {
        const tech = this.tech();
        if (!this.name() || !tech) return;
        scaffold({tech, control: this.sourceControl(), name: this.name()}, ".").then(({ config, blob }) => {
            if (confirm("download?")) saveAs(blob, "widget.zip");
            else console.log(blob);

            this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
            // injector.bindInstanceToCollection("widgetHandlers", );
            /* TODO register new widget and replace this instance of "Custom Widget" widget by an instance of the newly registered custom widget */
        });
    }
}