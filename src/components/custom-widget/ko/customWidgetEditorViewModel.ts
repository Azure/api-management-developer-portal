import * as ko from "knockout";
import template from "./customWidgetEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";
import { CustomWidgetModel } from "../customWidgetModel";
import { widgetEditorSelector } from "..";
import { StyleHelper } from "@paperbits/styles";
import { ViewManager } from "@paperbits/common/ui";
import { EventManager, Events } from "@paperbits/common/events";
import { buildBlobStorageSrc } from "../../custom-widget-scaffold/ko/utils";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class CustomWidgetEditorViewModel implements WidgetEditor<CustomWidgetModel> {
    public readonly name: ko.Observable<string>;
    public readonly uri: ko.Observable<string>;
    public readonly sizeStyleConfig: ko.Observable<SizeStylePluginConfig>;
    public readonly customInput1: ko.Observable<string>;
    public readonly customInputCode: ko.Observable<string>;
    public readonly customInputCodeValue: ko.Observable<string>;
    public readonly customInputCodeWithJS: ko.Observable<string>;

    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager
    ) {
        this.name = ko.observable();
        this.uri = ko.observable();
        this.sizeStyleConfig = ko.observable();
        this.customInput1 = ko.observable();
        this.customInputCode = ko.observable();
        this.customInputCodeValue = ko.observable();
        this.customInputCodeWithJS = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Event()
    public onChange: (model: CustomWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.name(this.model.name);
        this.uri(this.model.uri);

        this.name.subscribe(this.applyChanges);
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
        this.model.name = this.name();
        this.onChange(this.model);
    }

    public makeUri = (str: string): string => encodeURIComponent(str.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-"));

    public downloadScaffold(): void {
        if (!this.name()) return;

        let uri = this.uri();
        if (!uri) {
            uri = this.makeUri(this.name());
            this.uri(uri);
            this.model.uri = uri;
            this.onChange(this.model);
        }

        const storageUrl = buildBlobStorageSrc({uri});
        const a = document.createElement("a");
        a.href = `http://localhost:8000/scaffold?name=${this.name()}&uri=${uri}&storageUrl=${storageUrl}`;
        document.getElementById("customWidgetDownloadBtn").parentElement.append(a);
        a.click();
    }

    public registerScaffoldedWidget(): void {
        /* TODO register new widget and replace this instance of "Custom Widget" widget by it */
        alert("WiP");
    }
}