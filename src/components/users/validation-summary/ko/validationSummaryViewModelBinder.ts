import { ViewModelBinder } from "@paperbits/common/widgets";
import { ValidationSummaryViewModel } from "./validationSummaryViewModel";
import { ValidationSummaryModel } from "../validationSummaryModel";
import { Bag } from "@paperbits/common";


export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    public async modelToViewModel(model: ValidationSummaryModel, viewModel?: ValidationSummaryViewModel, bindingContext?: Bag<any>): Promise<ValidationSummaryViewModel> {
        if (!viewModel) {
            viewModel = new ValidationSummaryViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Validation summary",
                model: model,
                flow: "block",
                draggable: true
            };
        }

        return viewModel;
    }

    public canHandleModel(model: ValidationSummaryModel): boolean {
        return model instanceof ValidationSummaryModel;
    }
}