import * as ko from "knockout";
import template from "./customWidgetList.html";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { customWidgetUriKey } from "../custom-widget/ko/utils";
import { CustomWidgetHandlers } from "../custom-widget";
import { IWidgetService } from "@paperbits/common/widgets";
import { TCustomWidgetConfig } from "scaffold/scaffold";


@Component({
    selector: "custom-widget-list",
    template: template
})
export class ContentWorkshop {
    public readonly customWidgetConfigs: ko.Observable<TCustomWidgetConfig[]>;

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly viewManager: ViewManager,
    ) {
        this.customWidgetConfigs = ko.observable();
        this.loadCustomWidgets().then(configs => this.customWidgetConfigs(Object.values(configs)));
    }

    public async loadCustomWidgets(): Promise<Record<string, any>> {
        const configurations: Record<string, TCustomWidgetConfig> = {
            "test-uri": {
                name: "test-uri",
                displayName: "Test URI",
                category: "Custom widgets",
                // iconUrl: "https://...",
                uri: "test-uri",
            },
            "test-uri-x": {
                name: "test-uri-x",
                displayName: "Test URI 2",
                category: "Custom widgets",
                // iconUrl: "https://...",
                uri: "test-uri-x",
            },
        };

        const promises = [];

        const sources = new URLSearchParams(window.location.search).get("MS_APIM_CW_devsrcs");
        if (sources) {
            const sourcesObj = JSON.parse(sources);

            Object.keys(sourcesObj).forEach(key => {
                try {
                    const url = new URL(sourcesObj[key]);
                    window.sessionStorage.setItem(customWidgetUriKey(key), url.href);
                    promises.push(fetch(url.href + "msapim.config.json"));
                } catch (e) {
                    console.warn(key, sourcesObj[key], e);
                }
            });
        }

        return Promise.all(promises)
            .then(r => r.map(e => e.json()))
            .then(r => Promise.all(r).then(r => {
                r.forEach(config => {
                    configurations[config.name] = {
                        ...config,
                        customInputValue: JSON.stringify(config.customInputValue),
                    };
                });

                Object.values(configurations).forEach(config => {
                    console.log(config);
                    this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
                });

                return configurations;
            }));
    }

    public async openScaffoldWizard(): Promise<void> {
        const view: View = {
            heading: "Create custom widget",
            component: {
                name: "custom-widget-create",
                params: {
                    configs: this.customWidgetConfigs,
                    configAdd: (config: TCustomWidgetConfig) => this.customWidgetConfigs([...this.customWidgetConfigs(), config]),
                },
            },
        };
        this.viewManager.openViewAsWorkshop(view);
    }

    public async deleteWidget(config: TCustomWidgetConfig): Promise<void> {
        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${config.displayName}'?`)) return;

        this.customWidgetConfigs(this.customWidgetConfigs().filter(c => c.name !== config.name));
        // TODO delete from blob storage
    }
}
