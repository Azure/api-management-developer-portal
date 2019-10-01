import { ViewModelBinder } from "@paperbits/common/widgets";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordModel } from "../changePasswordModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
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