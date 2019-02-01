import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";


export class UserSignupViewModelBinder implements IViewModelBinder<UserSignupModel, UserSignupViewModel> {
    public modelToViewModel(model: UserSignupModel, readonly: boolean, viewModel?: UserSignupViewModel): UserSignupViewModel {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "User signup",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: UserSignupModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: UserSignupModel): boolean {
        return model instanceof UserSignupModel;
    }
}