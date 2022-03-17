import * as ko from "knockout";
import { saveAs } from "file-saver";
import scaffold, { TControl, TTech } from "scaffold/scaffold";
import template from "./customWidgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
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

    constructor() {
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
        scaffold({tech, control: this.sourceControl(), name: this.name()}, ".").then(blob => {
            if (confirm("download?")) saveAs(blob, "widget.zip");
            else console.log(blob);
        });
    }

    public registerScaffoldedWidget(): void {
        /* const mockOfAScaffoldedJSONFromTheBE = {
            name: "widget1",
            displayName: "Custom widget 1",
            category: "Advanced",
            iconUrl: "https://...",
            defaultConfig: { uri: "http..." },

            urlToBlobStorage: "url to the index.html of the newly registered widget on the blob storage (was pushed by the BE there during scaffolding)"
        } */

        /* TODO register new widget and replace this instance of "Custom Widget" widget by an instance of the newly registered custom widget */
        alert("WiP");
    }
}