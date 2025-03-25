import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { Logger } from "@paperbits/common/logging";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ValidationSummaryViewModel } from "./react/ValidationSummaryViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(nextState: WidgetState, componentInstance: any): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: nextState.isRedesignEnabled,
            styles: nextState.styles
        }));
    }

    public async modelToState(model: ValidationSummaryModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - ValidationSummaryViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}
