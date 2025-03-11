import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiViewModel } from "./react/DetailsOfApiViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: DetailsOfApiViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled,
            changeLogPageUrl: state.changeLogPageHyperlink?.href
        }));
    }

    public async modelToState(model: DetailsOfApiModel, state: WidgetState): Promise<void> {
        state.changeLogPageHyperlink = model.changeLogPageHyperlink;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - DetailsOfApiViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}