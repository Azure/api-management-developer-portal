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

const js = (customInputCodeValue) => `<script>
    console.log('${customInputCodeValue}');
    var value = JSON.parse('${customInputCodeValue}').data;

    function onChange(value) {
        console.log('onChange', {value});
        window.parent.postMessage({"customInputCode": value}, "${window.location.origin}");
    }
</script>`;

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
        this.customInput1(this.model.customInput1);
        this.customInputCode(this.model.customInputCode);
        this.customInputCodeValue(this.model.customInputCodeValue);
        this.customInputCodeWithJS(js(this.model.customInputCodeValue) + this.model.customInputCode);
        this.updateResponsiveObservables();

        window.addEventListener("message", event => {
            if (typeof event.data === "object" && "customInputCode" in event.data) {
                this.customInputCodeValue(JSON.stringify({data: event.data.customInputCode}));
            }
        });

        this.name.subscribe(this.applyChanges);
        this.customInput1.subscribe(this.applyChanges);
        this.customInputCode.subscribe(this.applyChanges);
        this.customInputCode.subscribe(this.applyChangeInputCode);
        this.customInputCodeValue.subscribe(this.applyChanges);
        this.eventManager.addEventListener(Events.ViewportChange, this.updateResponsiveObservables);

        this.propagateChanges();
        this.customInput1.subscribe(this.propagateChanges);
        this.customInputCodeValue.subscribe(this.propagateChanges);
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
        this.model.customInputCode = this.customInputCode();
        this.model.customInputCodeValue = this.customInputCodeValue();
        this.onChange(this.model);
    }

    private applyChangeInputCode(): void {
        this.customInputCodeWithJS(js(this.customInputCodeValue()) + this.customInputCode());
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
        if (!this.name()) return;

        let uri = this.uri();
        if (!uri) {
            uri = this.makeUri(this.name());
            this.uri(uri);
            this.model.uri = uri;
            this.onChange(this.model);
        }

        const storageUrl = `https://scaffoldtest.blob.core.windows.net/${uri}`;
        const a = document.createElement("a");
        a.href = `http://localhost:8000/scaffold?name=${this.name()}&uri=${uri}&storageUrl=${storageUrl}`;
        document.getElementById("customWidgetDownloadBtn").parentElement.append(a);
        a.click();
    }

    private propagateChanges(): void {
        const contentEditorDocument = (document.querySelector("#contentEditor > iframe") as HTMLIFrameElement).contentDocument;
        const contentWindow = (contentEditorDocument.getElementById(this.name()) as HTMLIFrameElement).contentWindow;
        contentWindow.postMessage({
            customInput1: this.customInput1(),
            customInputCodeValue: JSON.parse(this.customInputCodeValue()).data,
        }, "*");
    }
}