import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { Logger } from "@paperbits/common/logging";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import { ConfirmPasswordViewModel } from "./react/ConfirmPasswordViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ConfirmPasswordViewModelBinder implements ViewModelBinder<ConfirmPasswordModel, ConfirmPasswordViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ConfirmPasswordViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles}));
    }

    public async modelToState(model: ConfirmPasswordModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ConfirmPasswordViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}