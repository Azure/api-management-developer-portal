import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ValidationSummaryViewModel } from "./react/ValidationSummaryViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ValidationSummaryViewModelBinder implements ViewModelBinder<ValidationSummaryModel, ValidationSummaryViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
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

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}
