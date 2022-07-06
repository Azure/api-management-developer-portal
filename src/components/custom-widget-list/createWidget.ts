import * as ko from "knockout";
import { TScaffoldTech, TECHNOLOGIES, displayNameToName } from "@azure/api-management-custom-widgets-scaffolder";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
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

// TODO finish the command
const buildScaffoldCommand = ({displayName, tech}: TCustomWidgetConfig): string =>
    `npx ... --displayName="${displayName}" --tech="${tech}" --openUrl="${window.location.origin}"`

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
    public readonly techAll = TECHNOLOGIES.map(id => ({id, name: techToName[id]}));

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage
    ) {
        this.displayName = ko.observable("");
        this.tech = ko.observable(null);
        // this.sourceControl = ko.observable();
        this.commandToScaffold = ko.observable();
    }

    @Param()
    public model: CustomWidgetModel;

    @Param()
    private config?: TCustomWidgetConfig;

    @Param()
    private configs: TCustomWidgetConfig[];

    @Param()
    private configAdd: (config: TCustomWidgetConfig) => void;

    @Param()
    private configDelete: (config: TCustomWidgetConfig) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        if (this.config) {
            this.displayName(this.config.displayName);
            this.tech(this.config.tech);
            this.commandToScaffold(buildScaffoldCommand(this.config))
        }
    }

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

        this.commandToScaffold(buildScaffoldCommand(config));
    }

    public async deleteWidget(): Promise<void> {
        if (!this.config) return alert("Didn't found config to delete.")

        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${this.config.displayName}'?`)) return;

        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataSrc(this.config.name));
        blobsToDelete.push(buildBlobConfigSrc(this.config.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.configDelete(this.config);
    }
}
