import { ViewModelBinder } from "@paperbits/common/widgets";
import { ResetPasswordViewModel } from "./resetPasswordViewModel";
import { ResetPasswordModel } from "../resetPasswordModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";


export class ResetPasswordViewModelBinder implements ViewModelBinder<ResetPasswordModel, ResetPasswordViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
    public async modelToViewModel(model: ResetPasswordModel, viewModel?: ResetPasswordViewModel, bindingContext?: Bag<any>): Promise<ResetPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ResetPasswordViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Reset password",
            model: model,
            editor: "user-reset-editor",
            applyChanges: async (updatedModel: ResetPasswordModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ResetPasswordModel): boolean {
        return model instanceof ResetPasswordModel;
    }
}