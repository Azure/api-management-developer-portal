import { ViewModelBinder } from "@paperbits/common/widgets";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";


export class ConfirmPassworViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
    public async modelToViewModel(model: ConfirmPasswordModel, viewModel?: ConfirmPasswordViewModel, bindingContext?: Bag<any>): Promise<ConfirmPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ConfirmPasswordViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Confirm password",
            model: model,
            editor: "confirm-password-editor",
            applyChanges: async (updatedModel: ConfirmPasswordModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ConfirmPasswordModel): boolean {
        return model instanceof ConfirmPasswordModel;
    }
}