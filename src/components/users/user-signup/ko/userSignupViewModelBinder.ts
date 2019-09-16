import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupViewModel } from "./userSignupViewModel";
import { UserSignupModel } from "../userSignupModel";
import { Bag } from "@paperbits/common";


export class UserSignupViewModelBinder implements ViewModelBinder<UserSignupModel, UserSignupViewModel> {
    public async modelToViewModel(model: UserSignupModel, viewModel?: UserSignupViewModel, bindingContext?: Bag<any>): Promise<UserSignupViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "User signup",
            model: model,
            applyChanges: async (updatedModel: UserSignupModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSignupModel): boolean {
        return model instanceof UserSignupModel;
    }
}