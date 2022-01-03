import * as ko from "knockout";
import { saveAs } from "file-saver";
import { ViewManager, View } from "@paperbits/common/ui";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component } from "@paperbits/common/ko/decorators";
import { generateBlob } from "scaffold";
import { TCustomWidgetConfig } from "scaffold/scaffold";
import { MapiBlobStorage } from "../../persistence";
import { buildBlobConfigSrc, buildBlobDataSrc, widgetArchiveName } from "../custom-widget/ko/utils";
import template from "./customWidgetList.html";


@Component({
    selector: "custom-widget-list",
    template: template
})
export class ContentWorkshop {
    public readonly customWidgetConfigs: ko.Observable<TCustomWidgetConfig[]>;

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly viewManager: ViewManager,
        private readonly blobStorage: MapiBlobStorage,
        customWidgetConfigs: Promise<TCustomWidgetConfig[]>,
    ) {
        this.customWidgetConfigs = ko.observable();
        customWidgetConfigs.then(configs => this.customWidgetConfigs(configs));
    }

    public async openScaffoldWizard(): Promise<void> {
        const view: View = {
            heading: "Create new custom widget",
            component: {
                name: "custom-widget-create",
                params: {
                    configs: [...this.customWidgetConfigs()],
                    configAdd: (config: TCustomWidgetConfig) => this.customWidgetConfigs([...this.customWidgetConfigs(), config]),
                },
            },
        };
        this.viewManager.openViewAsWorkshop(view);
    }

    public async downloadWidget(config: TCustomWidgetConfig): Promise<void> {
        return saveAs(await generateBlob(config), widgetArchiveName(config));
    }

    public async deleteWidget(config: TCustomWidgetConfig): Promise<void> {
        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${config.displayName}'?`)) return;

        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataSrc(config.name));
        blobsToDelete.push(buildBlobConfigSrc(config.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.customWidgetConfigs(this.customWidgetConfigs().filter(c => c.name !== config.name));
    }
}
