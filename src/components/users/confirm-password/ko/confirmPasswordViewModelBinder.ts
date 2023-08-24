import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";

export class ConfirmPasswordViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ConfirmPasswordViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: ConfirmPasswordModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}