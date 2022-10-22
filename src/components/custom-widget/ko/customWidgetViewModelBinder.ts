import { Environment } from "@azure/api-management-custom-widgets-tools";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";
import { CustomWidgetViewModel } from "./customWidgetViewModel";
import { buildWidgetSource } from "./utils";

export class CustomWidgetViewModelBinder implements ViewModelBinder<CustomWidgetModel, CustomWidgetViewModel>  {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
        private readonly blobStorage: MapiBlobStorage,
    ) { }

    public stateToIntance(state: WidgetState, componentInstance: CustomWidgetViewModel): void {
        componentInstance.src(state.src);
        componentInstance.instanceId(state.instanceId);
        componentInstance.name(state.name);
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: CustomWidgetModel, state: WidgetState): Promise<void> {
        const environment = await this.settingsProvider.getSetting<string>("environment") as Environment;
        const widgetSource = await buildWidgetSource(this.blobStorage, model, environment, "index.html");
        state.src = widgetSource.src;
        state.instanceId = model.instanceId;
        state.name = model.name;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }   

    public canHandleModel(model: CustomWidgetModel): boolean {
        return model instanceof CustomWidgetModel;
    }
}