import * as ko from "knockout";
import { saveAs } from "file-saver";
import { scaffold } from "scaffold";
import { TControl, TCustomWidgetConfig, TTech } from "scaffold/scaffold";
import template from "./createWidget.html";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, Param } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common/utils";
import { MapiBlobStorage } from "../../persistence";
import { CustomWidgetHandlers } from "../custom-widget";
import { CustomWidgetModel } from "./customWidgetModel";
import {
    widgetArchiveName,
    buildBlobConfigSrc,
    dataFolder,
    root,
} from "../custom-widget/ko/utils";
// tslint:disable-next-line:no-implicit-dependencies
import fallbackUi from "!!raw-loader!./fallbackUi.html";

@Component({
    selector: "custom-widget-create",
    template: template
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly tech: ko.Observable<TTech | null>;
    public readonly sourceControl: ko.Observable<TControl>;

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage,
    ) {
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

        const {config, blob} = await scaffold({name, displayName, tech, control: this.sourceControl()});

        saveAs(blob, widgetArchiveName(config));

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigSrc(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        this.configs.push(config);
        this.configAdd(config);
    }
}