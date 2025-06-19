import { Environment } from "@azure/api-management-custom-widgets-tools";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { MapiBlobStorage } from "../../../persistence/mapiBlobStorage.browser";
import { CustomWidgetModel } from "../customWidgetModel";
import { CustomWidgetViewModel } from "./customWidgetViewModel";
import { buildWidgetSource } from "./utils";
import { Logger } from "@paperbits/common/logging";

export class CustomWidgetViewModelBinder implements ViewModelBinder<CustomWidgetModel, CustomWidgetViewModel>  {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
        private readonly blobStorage: MapiBlobStorage,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: CustomWidgetViewModel): void {
        componentInstance.config(state.config);
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: CustomWidgetModel, state: WidgetState): Promise<void> {
        const config: Record<string, unknown> = {}
        const widgetSource = await buildWidgetSource(this.blobStorage, model, this.settingsProvider, "index.html", this.logger);
        config.environment = await this.settingsProvider.getSetting<Environment>("environment");
        config.src = widgetSource.src;
        config.instanceId = model.instanceId;
        config.name = model.name;
        config.allowSameOrigin = model.allowSameOrigin;

        if (model.styles) {
            const styles = await this.styleCompiler.getStyleModelAsync(model.styles);
            state.styles = styles;
            config.classNames = styles.classNames;
        }

        state.config = JSON.stringify(config);
    }

    public canHandleModel(model: CustomWidgetModel): boolean {
        return model instanceof CustomWidgetModel;
    }
}