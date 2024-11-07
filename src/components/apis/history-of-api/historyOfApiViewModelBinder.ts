import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ApiHistoryViewModel } from "./react/ApiHistoryViewModel";
import { HistoryOfApiModel } from "./historyOfApiModel";
import { isRedesignEnabledSetting } from "../../../constants";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, ApiHistoryViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ApiHistoryViewModel): void {
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

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}