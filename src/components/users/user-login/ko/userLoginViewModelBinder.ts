import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserLoginViewModel } from "./userLoginViewModel";
import { UserLoginModel } from "../userLoginModel";
import { Bag } from "@paperbits/common";


export class UserLoginViewModelBinder implements ViewModelBinder<UserLoginModel, UserLoginViewModel> {
    public async modelToViewModel(model: UserLoginModel, viewModel?: UserLoginViewModel, bindingContext?: Bag<any>): Promise<UserLoginViewModel> {
        if (!viewModel) {
            viewModel = new UserLoginViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "User login",
            model: model,
            applyChanges: async (updatedModel: UserLoginModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserLoginModel): boolean {
        return model instanceof UserLoginModel;
    }
}