import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { HistoryOfApiViewModel } from "./react/HistoryOfApiViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
        private readonly logger: Logger
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: HistoryOfApiViewModel): void {
        componentInstance.setState(prevState => ({
            styles: state.styles,
            isRedesignEnabled: state.isRedesignEnabled,
            detailsPageUrl: state.detailsPageUrl
        }));
    }

    public async modelToState(model: HistoryOfApiModel, state: WidgetState): Promise<void> {
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - HistoryOfApiViewModelBinder` });
        } finally {
            state.isRedesignEnabled = isRedesignEnabled;
        }
    }
}