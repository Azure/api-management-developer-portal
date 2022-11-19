import * as ko from "knockout";
import * as validation from "knockout.validation";
import { ScaffoldTech, TECHNOLOGIES, displayNameToName } from "@azure/api-management-custom-widgets-scaffolder";
import { buildBlobConfigPath, buildBlobDataPath } from "@azure/api-management-custom-widgets-tools";
import { IWidgetService } from "@paperbits/common/widgets";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common/utils";
import { Logger } from "@paperbits/common/logging";
import { MapiBlobStorage } from "../../persistence";
import { CustomWidgetHandlers, CustomWidgetModelBinder, TCustomWidgetConfig, widgetCategory } from "../custom-widget";
import { CustomWidgetModel } from "./customWidgetModel";
import template from "./createWidget.html";
// tslint:disable-next-line:no-implicit-dependencies
import fallbackUi from "!!raw-loader!./fallbackUi.html";
import { KnockoutComponentBinder } from "@paperbits/core/ko/knockoutComponentBinder";
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from "../custom-widget/ko";

const techToName: Record<ScaffoldTech, string> = {
    typescript: "TypeScript",
    react: "React",
    vue: "Vue",
}

@Component({
    selector: "custom-widget-create",
    template: template,
})
export class CreateWidget {
    public readonly displayName: ko.Observable<string>;
    public readonly technology: ko.Observable<ScaffoldTech | null>;
    public readonly configNew: ko.Observable<TCustomWidgetConfig | null>;
    public readonly techAll = TECHNOLOGIES.map(id => ({ id, name: techToName[id] }));

    constructor(
        private readonly widgetService: IWidgetService,
        private readonly blobStorage: MapiBlobStorage,
        private readonly logger: Logger
    ) {
        this.displayName = ko.observable("");
        this.technology = ko.observable(null);
        this.configNew = ko.observable(null);

        validation.rules["customWidgetNameInUse"] = {
            validator: (displayName: string) =>
                !this.configs.find(({ name }) => name === displayNameToName(displayName)),
            message: (displayName: string) =>
                `A widget with alphanumerical signature '${displayNameToName(displayName)}' already exists.`
        };

        validation.registerExtenders();

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.displayName.extend(<any>{ required: { message: `Name is required.` } });
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
        } else {
            this.displayName.extend(<any>{ customWidgetNameInUse: this.displayName })
        }
    }

    public async submitData(): Promise<void> {
        const displayName = this.displayName();
        const technology = this.technology();
        if (!displayName || !technology) return;

        const name = displayNameToName(displayName);

        if (this.configs.find((config) => config.name === name)) return;

        const config: TCustomWidgetConfig = { name, displayName, technology };

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigPath(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        const dataPath = buildBlobDataPath(name);
        await this.blobStorage.uploadBlob(`/${dataPath}index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${dataPath}editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidget(name, {
            modelDefinition: CustomWidgetModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetViewModel,
            modelBinder: CustomWidgetModelBinder,
            viewModelBinder: CustomWidgetViewModelBinder
        });

        this.widgetService.registerWidgetEditor(name, {
            displayName: displayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-component",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetEditorViewModel,
            handlerComponent: new CustomWidgetHandlers(config)
        });

        this.configs.push(config);
        this.configAdd(config);
        this.configNew(config);
        this.logCreateWidget(config)
    }

    public async deleteWidget(): Promise<void> {
        if (!this.config) return alert("Didn't found config to delete.")

        if (!confirm(`This operation is in-reversible, are you sure you want to delete custom widget '${this.config.displayName}'?`)) return;

        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataPath(this.config.name));
        blobsToDelete.push(buildBlobConfigPath(this.config.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.configDelete(this.config);

        this.logDeleteWidget(this.config);
    }

    public logCreateWidget(config: { name: string, displayName: string, technology: ScaffoldTech }): void {
        this.logger.trackEvent("CustomWidgetCreate", config);
    }

    public logDeleteWidget(config: { name: string, displayName: string, technology: ScaffoldTech }): void {
        this.logger.trackEvent("CustomWidgetDelete", config);
    }
}
