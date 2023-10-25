import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ValidationSummaryModel } from "../validationSummaryModel";
import { ValidationSummaryViewModel } from "./validationSummaryViewModel";


export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ValidationSummaryViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: ValidationSummaryModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}