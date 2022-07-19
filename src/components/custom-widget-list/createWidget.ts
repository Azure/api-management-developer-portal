import * as ko from "knockout";
import { TScaffoldTech, TECHNOLOGIES, displayNameToName } from "@azure/api-management-custom-widgets-scaffolder";
import { buildBlobConfigPath, buildBlobDataPath } from "@azure/api-management-custom-widgets-tools";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common/utils";
import { MapiBlobStorage } from "../../persistence";
import { CustomWidgetHandlers, TCustomWidgetConfig } from "../custom-widget";
import { CustomWidgetModel } from "./customWidgetModel";
import template from "./createWidget.html";
// tslint:disable-next-line:no-implicit-dependencies
import fallbackUi from "!!raw-loader!./fallbackUi.html";

const techToName: Record<TScaffoldTech, string> = {
    typescript: "TypeScript",
    react: "React",
}

// TODO finish the command
const buildScaffoldCommand = ({displayName, technology}: TCustomWidgetConfig): string =>
    `npx @azure/api-management-custom-widgets-scaffolder --displayName="${displayName}" --technology="${technology}" --openUrl="${window.location.origin}"`

@Component({
    selector: "custom-widget-create",
    template: template,
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly technology: ko.Observable<TScaffoldTech | null>;
    // public readonly sourceControl: ko.Observable<TScaffoldSourceControl>;
    public readonly commandToScaffold: ko.Observable<string>;
    public readonly customWidgetConfigs: ko.Observable<TCustomWidgetConfig[]>;
    public readonly techAll = TECHNOLOGIES.map(id => ({id, name: techToName[id]}));

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage
    ) {
        this.displayName = ko.observable("");
        this.technology = ko.observable(null);
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
            this.technology(this.config.technology);
            this.commandToScaffold(buildScaffoldCommand(this.config))
        }
    }

    public async submitData(): Promise<void> {
        const displayName = this.displayName();
        const technology = this.technology();
        if (!displayName || !technology) return;

        const name = displayNameToName(displayName);

        if (this.configs.find((config) => config.name === name)) {
            alert("A widget with the same alphanumerical signature already exists.");
            return;
        }

        const config = {name, displayName, technology}; // , control: this.sourceControl()};
        // const configDeploy = await buildConfigDeploy();

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigPath(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        const dataPath = buildBlobDataPath(name);
        await this.blobStorage.uploadBlob(`/${dataPath}index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${dataPath}editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidgetHandler(new CustomWidgetHandlers(config));
        this.configs.push(config);
        this.configAdd(config);

        this.commandToScaffold(buildScaffoldCommand(config));
    }

    public async deleteWidget(): Promise<void> {
        if (!this.config) return alert("Didn't found config to delete.")

        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${this.config.displayName}'?`)) return;

        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataPath(this.config.name));
        blobsToDelete.push(buildBlobConfigPath(this.config.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.configDelete(this.config);
    }
}
