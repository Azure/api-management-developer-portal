import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupSocialViewModel } from "./userSignupSocialViewModel";
import { UserSignupSocialModel } from "../userSignupSocialModel";
import { Bag } from "@paperbits/common";

export class UserSignupSocialViewModelBinder implements ViewModelBinder<UserSignupSocialModel, UserSignupSocialViewModel> {
    public async modelToViewModel(model: UserSignupSocialModel, viewModel?: UserSignupSocialViewModel, bindingContext?: Bag<any>): Promise<UserSignupSocialViewModel> {
        if (!viewModel) {
            viewModel = new UserSignupSocialViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Sign up: OAuth",
            model: model
        };

        return viewModel;
    }

    public canHandleModel(model: UserSignupSocialModel): boolean {
        return model instanceof UserSignupSocialModel;
    }
}