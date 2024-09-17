import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { isRedesignEnabledSetting } from "../../../../constants";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: HistoryOfApiViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
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