import * as ko from "knockout";
import { View, ViewManager } from "@paperbits/common/ui";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component } from "@paperbits/common/ko/decorators";
import { MapiBlobStorage } from "../../persistence";
import { TCustomWidgetConfig } from "../custom-widget";
import template from "./customWidgetList.html";
import { listConfigBlobs } from "./loadCustomWidgetConfigs";


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
        customWidgetConfigsPromise: Promise<TCustomWidgetConfig[]>,
    ) {
        this.customWidgetConfigs = ko.observable();
        const refreshConfigs = listConfigBlobs(blobStorage); // in case some configs on the blob storage got deleted/updated/added
        Promise.all([refreshConfigs, customWidgetConfigsPromise]).then(([configBlobs, configsAll]) => {
            const configs: Record<string, TCustomWidgetConfig> = {};
            configBlobs.forEach(config => configs[config.name] = config);
            configsAll.forEach(config => {
                if (config.override) configs[config.name] = config
            });
            this.customWidgetConfigs(Object.values(configs).sort(ContentWorkshop.sortByName))
        });
    }

    private static sortByName(a: TCustomWidgetConfig, b: TCustomWidgetConfig): number {
        return a.name.localeCompare(b.name);
    }

    public async openScaffoldWizard(config?: TCustomWidgetConfig): Promise<void> {
        const view: View = {
            heading: "Custom widget",
            component: {
                name: "custom-widget-create",
                params: {
                    config,
                    configs: [...this.customWidgetConfigs()],
                    configAdd: (config: TCustomWidgetConfig): void => {
                        this.customWidgetConfigs(
                            [...this.customWidgetConfigs(), config].sort(ContentWorkshop.sortByName)
                        );
                    },
                    configDelete: (config: TCustomWidgetConfig): void => {
                        this.customWidgetConfigs(this.customWidgetConfigs().filter(c => c.name !== config.name));
                        this.viewManager.closeWorkshop(view);
                    },
                },
            },
        };
        this.viewManager.openViewAsWorkshop(view);
    }
}
