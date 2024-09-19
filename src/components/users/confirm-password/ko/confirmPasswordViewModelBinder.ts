import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { isRedesignEnabledSetting } from "../../../../constants";

export class ConfirmPasswordViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ConfirmPasswordViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);
    }

    public async modelToState(model: ConfirmPasswordModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}