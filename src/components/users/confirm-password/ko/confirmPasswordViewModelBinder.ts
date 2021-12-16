import { ViewModelBinder } from "@paperbits/common/widgets";
import { Bag } from "@paperbits/common";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { ComponentFlow } from "@paperbits/common/editing";



export class ConfirmPassworViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    public async modelToViewModel(model: ConfirmPasswordModel, viewModel?: ConfirmPasswordViewModel, bindingContext?: Bag<any>): Promise<ConfirmPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ConfirmPasswordViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Password: Confirmation form",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true
            };
        }

        return viewModel;
    }

    public canHandleModel(model: ConfirmPasswordModel): boolean {
        return model instanceof ConfirmPasswordModel;
    }
}