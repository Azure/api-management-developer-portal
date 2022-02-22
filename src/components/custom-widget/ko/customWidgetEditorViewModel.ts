import * as ko from "knockout";
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
    public readonly tech: ko.Observable<string>;
    public readonly sourceControl: ko.Observable<string>;

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
        if (!this.name()) return;
        /*
        const a = document.createElement("a");
        a.href = `http://localhost:8000/scaffold?name=${this.name()}`;
        document.getElementById("customWidgetDownloadBtn").parentElement.append(a);
        a.click();
         */
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