import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { SignupSocialModel } from "../signupSocialModel";
import { SignupSocialViewModel } from "./signupSocialViewModel";

export class SignupSocialViewModelBinder implements ViewModelBinder<SignupSocialModel, SignupSocialViewModel> {
    public async modelToViewModel(model: SignupSocialModel, viewModel?: SignupSocialViewModel, bindingContext?: Bag<any>): Promise<SignupSocialViewModel> {
        if (!viewModel) {
            viewModel = new SignupSocialViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Sign-up form: OAuth",
            model: model,
            flow: ComponentFlow.Block,
            draggable: true
        };

        return viewModel;
    }

    public canHandleModel(model: SignupSocialModel): boolean {
        return model instanceof SignupSocialModel;
    }
}