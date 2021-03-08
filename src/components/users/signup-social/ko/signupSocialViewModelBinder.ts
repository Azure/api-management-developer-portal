import { ViewModelBinder } from "@paperbits/common/widgets";
import { SignupSocialViewModel } from "./signupSocialViewModel";
import { SignupSocialModel } from "../signupSocialModel";
import { Bag } from "@paperbits/common";

export class SignupSocialViewModelBinder implements ViewModelBinder<SignupSocialModel, SignupSocialViewModel> {
    public async modelToViewModel(model: SignupSocialModel, viewModel?: SignupSocialViewModel, bindingContext?: Bag<any>): Promise<SignupSocialViewModel> {
        if (!viewModel) {
            viewModel = new SignupSocialViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Sign-up form: OAuth",
            model: model,
            flow: "block",
            draggable: true
        };

        return viewModel;
    }

    public canHandleModel(model: SignupSocialModel): boolean {
        return model instanceof SignupSocialModel;
    }
}