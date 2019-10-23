import { ViewModelBinder } from "@paperbits/common/widgets";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordModel } from "../changePasswordModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {

    constructor(private readonly eventManager: EventManager) {}
    
    public async modelToViewModel(model: ChangePasswordModel, viewModel?: ChangePasswordViewModel, bindingContext?: Bag<any>): Promise<ChangePasswordViewModel> {
        if (!viewModel) {
            viewModel = new ChangePasswordViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Change password",
            model: model,
            editor: "change-password-editor",
            applyChanges: async (updatedModel: ChangePasswordModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ChangePasswordModel): boolean {
        return model instanceof ChangePasswordModel;
    }
}