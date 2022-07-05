import * as ko from "knockout";
import { TScaffoldTech, TECHNOLOGIES, displayNameToName } from "@azure/api-management-custom-widgets-scaffolder";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, Param } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common/utils";
import { MapiBlobStorage } from "../../persistence";
import { CustomWidgetHandlers, TCustomWidgetConfig } from "../custom-widget";
import { buildBlobConfigSrc, buildBlobDataSrc, dataFolder, root } from "../custom-widget/ko/utils";
import { CustomWidgetModel } from "./customWidgetModel";
import template from "./createWidget.html";
// tslint:disable-next-line:no-implicit-dependencies
import fallbackUi from "!!raw-loader!./fallbackUi.html";

const techToName: Record<TScaffoldTech, string> = {
    typescript: "TypeScript",
    react: "React",
}

@Component({
    selector: "custom-widget-create",
    template: template,
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly tech: ko.Observable<TScaffoldTech | null>;
    // public readonly sourceControl: ko.Observable<TScaffoldSourceControl>;
    public readonly commandToScaffold: ko.Observable<string>;
    public readonly customWidgetConfigs: ko.Observable<TCustomWidgetConfig[]>;
    public readonly techAll = TECHNOLOGIES.map(t => ({id: t, name: techToName[t]}));

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage
    ) {
        this.displayName = ko.observable("");
        this.tech = ko.observable();
        // this.sourceControl = ko.observable();
        this.commandToScaffold = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Param()
    private config?: TCustomWidgetConfig;

    @Param()
    private configs?: TCustomWidgetConfig[];

    @Param()
    private configAdd?: (config: TCustomWidgetConfig) => void;

    @Param()
    private configDelete?: (config: TCustomWidgetConfig) => void;

    public async submitData(): Promise<void> {
        const displayName = this.displayName();
        const tech = this.tech();
        if (!displayName || !tech) return;

        const name = displayNameToName(displayName);

        if (this.configs.find((config) => config.name === name)) {
            alert("A widget with the same alphanumerical signature already exists.");
            return;
        }

        const config = {name, displayName, tech}; // , control: this.sourceControl()};
        // const configDeploy = await buildConfigDeploy();

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigSrc(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${root}/${dataFolder}/${name}/editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        this.configs.push(config);
        this.configAdd(config);

        // TODO finish the command
        this.commandToScaffold(`npx ... --displayName="${displayName}" --tech="${tech}" --openUrl="${window.location.origin}"`);
    }

    public async deleteWidget(config: TCustomWidgetConfig): Promise<void> {
        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${config.displayName}'?`)) return;

        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataSrc(config.name));
        blobsToDelete.push(buildBlobConfigSrc(config.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.configDelete(config);
    }
}
