import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow, IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { CustomWidgetViewModel } from "./customWidgetViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { CustomWidgetModel } from "../customWidgetModel";
import { buildRemoteFilesSrc } from "./utils";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class CustomWidgetViewModelBinder implements ViewModelBinder<CustomWidgetModel, CustomWidgetViewModel>  {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    public async updateViewModel(model: CustomWidgetModel, viewModel: CustomWidgetViewModel, bindingContext: Bag<any>): Promise<void> {
        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager));
        }

        const environment = await this.settingsProvider.getSetting<string>("environment");
        viewModel.name(model.name);
        viewModel.src(buildRemoteFilesSrc(model, "index.html", environment));
    }

    public async modelToViewModel(model: CustomWidgetModel, viewModel?: CustomWidgetViewModel, bindingContext?: Bag<any>): Promise<CustomWidgetViewModel> {
        if (!viewModel) {
            viewModel = new CustomWidgetViewModel();

            const binding: IWidgetBinding<CustomWidgetModel, CustomWidgetViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
                flow: ComponentFlow.Block,
                editor: widgetEditorSelector,
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };

            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel, bindingContext);

        return viewModel;
    }

    public canHandleModel(model: CustomWidgetModel): boolean {
        return model instanceof CustomWidgetModel;
    }
}