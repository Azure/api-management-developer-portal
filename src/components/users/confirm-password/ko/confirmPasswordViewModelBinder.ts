import { ViewModelBinder } from "@paperbits/common/widgets";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordModel } from "../confirmPasswordModel";



export class ConfirmPassworViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    constructor(private readonly eventManager: EventManager) {}
    
    public async modelToViewModel(model: ConfirmPasswordModel, viewModel?: ConfirmPasswordViewModel, bindingContext?: Bag<any>): Promise<ConfirmPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ConfirmPasswordViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Password: Confirmation form",
                model: model,
                flow: "block",
                draggable: true
            };
        }

        return viewModel;
    }

    public canHandleModel(model: ConfirmPasswordModel): boolean {
        return model instanceof ConfirmPasswordModel;
    }
}