import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSigninViewModel } from "./userSigninViewModel";
import { UserSigninModel } from "../userSigninModel";
import { Bag } from "@paperbits/common";


export class UserSigninViewModelBinder implements ViewModelBinder<UserSigninModel, UserSigninViewModel> {
    public async modelToViewModel(model: UserSigninModel, viewModel?: UserSigninViewModel, bindingContext?: Bag<any>): Promise<UserSigninViewModel> {
        if (!viewModel) {
            viewModel = new UserSigninViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "User login",
            displayName: "Sign-in form",
            model: model,
            applyChanges: async (updatedModel: UserSigninModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSigninModel): boolean {
        return model instanceof UserSigninModel;
    }
}