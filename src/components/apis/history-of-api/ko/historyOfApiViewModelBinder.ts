import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { StyleCompiler } from "@paperbits/common/styles";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: HistoryOfApiViewModel): void {
        componentInstance.styles(state.styles);

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
    }
}