import { ViewModelBinder } from "@paperbits/common/widgets";
import { Bag } from "@paperbits/common";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ConfirmPasswordHandlers } from "../confirmPasswordHandlers";



export class ConfirmPassworViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }


    public async modelToViewModel(model: ConfirmPasswordModel, viewModel?: ConfirmPasswordViewModel, bindingContext?: Bag<any>): Promise<ConfirmPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ConfirmPasswordViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Password: Confirmation form",
                layer: bindingContext?.layer,
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                handler: ConfirmPasswordHandlers,
                applyChanges: async (updatedModel: ConfirmPasswordModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ConfirmPasswordHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ConfirmPasswordModel): boolean {
        return model instanceof ConfirmPasswordModel;
    }
}