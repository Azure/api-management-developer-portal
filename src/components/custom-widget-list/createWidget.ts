import * as ko from "knockout";
import { saveAs } from "file-saver";
import { scaffold } from "scaffold";
import { TControl, TCustomWidgetConfig, TTech } from "scaffold/scaffold";
import template from "./createWidget.html";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, Param } from "@paperbits/common/ko/decorators";
import { CustomWidgetHandlers } from "../custom-widget";
import { CustomWidgetModel } from "./customWidgetModel";
import { widgetArchiveName } from "../custom-widget/ko/utils";
// import { widgetEditorSelector } from "..";

@Component({
    selector: "custom-widget-create",
    template: template
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly tech: ko.Observable<TTech | null>;
    public readonly sourceControl: ko.Observable<TControl>;

    constructor(private readonly widgetService: IWidgetService) {
        this.displayName = ko.observable("");
        this.tech = ko.observable();
        this.sourceControl = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Param()
    private configs: TCustomWidgetConfig[];

    @Param()
    private configAdd: (config: TCustomWidgetConfig) => void;

    public async downloadScaffold(): Promise<void> {
        const displayName = this.displayName();
        const tech = this.tech();
        if (!displayName || !tech) return;

        const name = encodeURIComponent(displayName.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "-"));

        if (this.configs.find(c => c.name === name)) {
            alert("A widget with the same alphanumerical signature already exists.");
            return;
        }

        const {config, blob} = await scaffold({name, displayName, tech, control: this.sourceControl()}, ".");

        if (confirm("download?")) saveAs(blob, widgetArchiveName(config));
        else console.log(blob);

        this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        this.configs.push(config);
        this.configAdd(config);
    }
}