import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ValidationSummaryModel } from "../validationSummaryModel";
import { ValidationSummaryViewModel } from "./validationSummaryViewModel";


export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    public async modelToViewModel(model: ValidationSummaryModel, viewModel?: ValidationSummaryViewModel, bindingContext?: Bag<any>): Promise<ValidationSummaryViewModel> {
        if (!viewModel) {
            viewModel = new ValidationSummaryViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Validation summary",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true
            };
        }

        return viewModel;
    }

    public canHandleModel(model: ValidationSummaryModel): boolean {
        return model instanceof ValidationSummaryModel;
    }
}