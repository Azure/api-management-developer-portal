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

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class CustomWidgetEditorViewModel implements WidgetEditor<CustomWidgetModel> {
    public readonly name: ko.Observable<string>;
    public readonly storageUri: ko.Observable<string>;
    public readonly sizeStyleConfig: ko.Observable<SizeStylePluginConfig>;
    public readonly customInput1: ko.Observable<string>;

    constructor(
        private readonly viewManager: ViewManager,
        private readonly eventManager: EventManager
    ) {
        this.name = ko.observable();
        this.storageUri = ko.observable();
        this.sizeStyleConfig = ko.observable();
        this.customInput1 = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Event()
    public onChange: (model: CustomWidgetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.name(this.model.name);
        this.storageUri(this.model.storageUri);
        this.customInput1(this.model.customInput1);
        this.updateResponsiveObservables();

        this.name.subscribe(this.applyChanges);
        this.customInput1.subscribe(this.applyChanges);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateResponsiveObservables);

        this.propagateChanges("customInput1");
        this.customInput1.subscribe(() => this.propagateChanges("customInput1"));
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
        this.model.customInput1 = this.customInput1();
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

    public makeUri = (str: string): string => encodeURIComponent(str.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-"));

    public downloadScaffold(): void {
        if (!this.storageUri() && this.name()) {
            const uri = this.makeUri(this.name());
            const storageUrl = `https://scaffoldtest.blob.core.windows.net/${uri}`;
            this.storageUri(storageUrl + "/index.html");
            this.model.storageUri = storageUrl + "/index.html";
            this.onChange(this.model);

            const a = document.createElement("a");
            a.href = `http://localhost:8000/scaffold?name=${this.name()}&uri=${uri}&storageUrl=${storageUrl}`;
            document.getElementById("customWidgetDownloadBtn").parentElement.append(a);
            a.click();
        }
    }

    private propagateChanges(key: string): void {
        const contentEditorDocument = (document.querySelector("#contentEditor > iframe") as HTMLIFrameElement).contentDocument;
        const contentWindow = (contentEditorDocument.getElementById(this.storageUri()) as HTMLIFrameElement).contentWindow;
        contentWindow.postMessage({[key]: this[key]()}, "*");
    }
}