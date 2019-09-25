import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserResetPswdViewModel } from "./userResetPswdViewModel";
import { UserResetPswdModel } from "../userResetPswdModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";


export class UserResetPswdViewModelBinder implements ViewModelBinder<UserResetPswdModel, UserResetPswdViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
    public async modelToViewModel(model: UserResetPswdModel, viewModel?: UserResetPswdViewModel, bindingContext?: Bag<any>): Promise<UserResetPswdViewModel> {
        if (!viewModel) {
            viewModel = new UserResetPswdViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Reset password confirm",
            model: model,
            editor: "user-reset-pswd-editor",
            applyChanges: async (updatedModel: UserResetPswdModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserResetPswdModel): boolean {
        return model instanceof UserResetPswdModel;
    }
}