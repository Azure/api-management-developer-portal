import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { WidgetViewModel } from "./widgetViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { WidgetModel } from "../widgetModel";



/**
 * This class describes how the model needs to be presented (as a view model)
 * in a specific UI framework.
 */
export class WidgetViewModelBinder implements ViewModelBinder<WidgetModel, WidgetViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: WidgetModel, viewModel: WidgetViewModel): Promise<void> {
        // viewModel.property(model.value)
    }

    public async modelToViewModel(model: WidgetModel, viewModel?: WidgetViewModel, bindingContext?: Bag<any>): Promise<WidgetViewModel> {
        if (!viewModel) {
            viewModel = new WidgetViewModel();

            const binding: IWidgetBinding<WidgetModel, WidgetViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
                flow: "block",
                editor: widgetEditorSelector,
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };

            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel);

        return viewModel;
    }

    public canHandleModel(model: WidgetModel): boolean {
        return model instanceof WidgetModel;
    }
}