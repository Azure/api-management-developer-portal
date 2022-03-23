import * as ko from "knockout";
import { saveAs } from "file-saver";
import template from "./customWidgetList.html";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { OVERRIDE_CONFIG_SESSION_KEY_PREFIX, widgetArchiveName } from "../custom-widget/ko/utils";
import { CustomWidgetHandlers } from "../custom-widget";
import { IWidgetService } from "@paperbits/common/widgets";
import { generateBlob } from "scaffold";
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

    private async loadCustomWidgets(): Promise<Record<string, any>> {
        const configsPromises = [];

        // TODO load configs from blob storage async

        const overridesPromises = [];

        /* load overrides */
        const sourcesSession = Object.keys(window.sessionStorage)
            .filter((key: string) => key.startsWith(OVERRIDE_CONFIG_SESSION_KEY_PREFIX))
            .map(key => window.sessionStorage.getItem(key));
        const sourcesSearchParams = new URLSearchParams(window.location.search).getAll("MS_APIM_CW_devsrc");
        const sources = [...new Set([...sourcesSession, ...sourcesSearchParams])];
        if (sources.length) {
            sources.forEach(source => {
                try {
                    const url = new URL(source);
                    overridesPromises.push(fetch(url.href + "config.msapim.json"));
                } catch (e) {
                    console.warn(source, e);
                }
            });
        }

        const promisesToJson = async promises => Promise.all(await Promise.all(promises).then(r => r.map(e => e.json())));
        const configs: TCustomWidgetConfig[] = [{
            name: "test-uri",
            displayName: "Test URI",
            category: "Custom widgets",
            tech: "react",
            deployed: {},
        }, {
            name: "test-uri-x",
            displayName: "Test URI X",
            category: "Custom widgets",
            tech: "react",
            deployed: {},
        }]; // await promisesToJson(configsPromises);
        const overrides: TCustomWidgetConfig[] = await promisesToJson(overridesPromises);

        console.log({configs, overrides});

        const configurations: Record<string, TCustomWidgetConfig> = {};

        configs.forEach(config => configurations[config.name] = config);
        overrides.forEach((override, i) => {
            const href = new URL(sources[i]).href;
            window.sessionStorage.setItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + override.name, href);
            configurations[override.name] = {...override, override: href ?? true};
        });

        Object.values(configurations).forEach(config => {
            console.log(config);
            this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        });

        return configurations;
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

    public async publishWidget(config: TCustomWidgetConfig): Promise<void> {
        if (!confirm(`This operation is in-reversible – it overwrites currently published version of this custom widget. Are you sure you want to proceed with publishing '${config.displayName}'?`)) return;

        // TODO copy on blob storage
    }

    public async downloadWidget(config: TCustomWidgetConfig): Promise<void> {
        return saveAs(await generateBlob(config), widgetArchiveName(config));
    }

    public async deleteWidget(config: TCustomWidgetConfig): Promise<void> {
        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${config.displayName}'?`)) return;

        this.customWidgetConfigs(this.customWidgetConfigs().filter(c => c.name !== config.name));
        // TODO delete from blob storage
    }
}
