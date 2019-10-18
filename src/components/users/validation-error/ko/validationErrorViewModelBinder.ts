import { ViewModelBinder } from "@paperbits/common/widgets";
import { ValidationErrorViewModel } from "./validationErrorViewModel";
import { ValidationErrorModel } from "../validationErrorModel";
import { Bag } from "@paperbits/common";


export class ValidationErrorViewModelBinder implements ViewModelBinder<ValidationErrorModel, ValidationErrorViewModel> {
    public async modelToViewModel(model: ValidationErrorModel, viewModel?: ValidationErrorViewModel, bindingContext?: Bag<any>): Promise<ValidationErrorViewModel> {
        if (!viewModel) {
            viewModel = new ValidationErrorViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Validation Error",
            model: model,
            editor: "validation-error-editor",
            applyChanges: async (updatedModel: ValidationErrorModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ValidationErrorModel): boolean {
        return model instanceof ValidationErrorModel;
    }
}