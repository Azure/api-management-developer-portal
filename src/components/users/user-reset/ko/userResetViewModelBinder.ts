import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserResetViewModel } from "./userResetViewModel";
import { UserResetModel } from "../userResetModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";


export class UserResetViewModelBinder implements ViewModelBinder<UserResetModel, UserResetViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
    public async modelToViewModel(model: UserResetModel, viewModel?: UserResetViewModel, bindingContext?: Bag<any>): Promise<UserResetViewModel> {
        if (!viewModel) {
            viewModel = new UserResetViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "User reset password request",
            model: model,
            editor: "user-reset-editor",
            applyChanges: async (updatedModel: UserResetModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserResetModel): boolean {
        return model instanceof UserResetModel;
    }
}