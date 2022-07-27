import * as ko from "knockout";
import {
    TCustomWidgetConfig,
    TScaffoldSourceControl,
    TScaffoldTech,
} from "@azure/apimanagement-custom-widget-scaffolder";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, Param } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common/utils";
import { MapiBlobStorage } from "../../persistence";
import { managementApiVersion } from "../../constants";
import { CustomWidgetHandlers } from "../custom-widget";
import { buildBlobConfigSrc, dataFolder, root } from "../custom-widget/ko/utils";
import { CustomWidgetModel } from "./customWidgetModel";
import template from "./createWidget.html";
// tslint:disable-next-line:no-implicit-dependencies
import fallbackUi from "!!raw-loader!./fallbackUi.html";

@Component({
    selector: "custom-widget-create",
    template: template,
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly tech: ko.Observable<TScaffoldTech | null>;
    public readonly sourceControl: ko.Observable<TScaffoldSourceControl>;
    public readonly commandToScaffold: ko.Observable<string>;

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage
    ) {
        this.displayName = ko.observable("");
        this.tech = ko.observable();
        this.sourceControl = ko.observable();
        this.commandToScaffold = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Param()
    private configs: TCustomWidgetConfig[];

    @Param()
    private configAdd: (config: TCustomWidgetConfig) => void;

    public async submitData(): Promise<void> {
        const displayName = this.displayName();
        const tech = this.tech();
        if (!displayName || !tech) return;

        // TODO remove
        const displayNameToName = (displayName: string) =>
            encodeURIComponent(
                displayName
                    .normalize("NFD")
                    .toLowerCase()
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9-]/g, "-")
            );

        const name = displayNameToName(displayName);

        if (this.configs.find((config) => config.name === name)) {
            alert("A widget with the same alphanumerical signature already exists.");
            return;
        }

        const config = {name, displayName, tech, control: this.sourceControl()};
        // const configDeploy = await buildConfigDeploy();

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigSrc(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        this.configs.push(config);
        this.configAdd(config);

        this.commandToScaffold(`npx ... --displayName="${displayName}" --tech="${tech}"" --apiVersion="${managementApiVersion}" --openUrl="${window.location.origin}"`);
    }
}
