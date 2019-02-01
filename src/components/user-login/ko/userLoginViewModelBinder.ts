import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserLoginViewModel } from "./userLoginViewModel";
import { UserLoginModel } from "../userLoginModel";


export class UserLoginViewModelBinder implements IViewModelBinder<UserLoginModel, UserLoginViewModel> {
    public modelToViewModel(model: UserLoginModel, readonly: boolean, viewModel?: UserLoginViewModel): UserLoginViewModel {
        if (!viewModel) {
            viewModel = new UserLoginViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "User login",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: UserLoginModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: UserLoginModel): boolean {
        return model instanceof UserLoginModel;
    }
}