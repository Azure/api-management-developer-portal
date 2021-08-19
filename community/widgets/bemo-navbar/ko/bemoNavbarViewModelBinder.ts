import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { BemoNavbarViewModel } from "./bemoNavbarViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { BemoNavbarModel } from "../bemoNavbarModel";

/**
 * This class describes how the model needs to be presented (as a view model)
 * in a specific UI framework.
 */
export class BemoNavbarViewModelBinder implements ViewModelBinder<BemoNavbarModel, BemoNavbarViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: BemoNavbarModel, viewModel: BemoNavbarViewModel): Promise<void> {
        // viewModel.property(model.value)
    }

    public async modelToViewModel(model: BemoNavbarModel, viewModel?: BemoNavbarViewModel, bindingContext?: Bag<any>): Promise<BemoNavbarViewModel> {
        if (!viewModel) {
            viewModel = new BemoNavbarViewModel();

            const binding: IWidgetBinding<BemoNavbarModel, BemoNavbarViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
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

    public canHandleModel(model: BemoNavbarModel): boolean {
        return model instanceof BemoNavbarModel;
    }
}