import * as ko from "knockout";
// import { saveAs } from "file-saver";
import { View, ViewManager } from "@paperbits/common/ui";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component } from "@paperbits/common/ko/decorators";
import { MapiBlobStorage } from "../../persistence";
import { TCustomWidgetConfig } from "../custom-widget";
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
        customWidgetConfigs.then(configs =>
            this.customWidgetConfigs(configs.sort(ContentWorkshop.sortByName))
        );
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
