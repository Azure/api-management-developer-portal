import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { OperationListViewModel } from "./operationListViewModel";
import { OperationListModel } from "../operationListModel";
import { StyleCompiler } from "@paperbits/common/styles";


export class OperationListViewModelBinder implements ViewModelBinder<OperationListModel, OperationListViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: OperationListViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            wrapText: state.wrapText,
            showToggleUrlPath: state.showToggleUrlPath,
            defaultShowUrlPath: state.defaultShowUrlPath,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            defaultAllGroupTagsExpanded: state.defaultAllGroupTagsExpanded,
            detailsPageUrl: state.detailsPageUrl
        }));
    }

    public async modelToState(model: OperationListModel, state: WidgetState): Promise<void> {
        state.allowSelection = model.allowSelection;
        state.wrapText = model.wrapText;
        state.showToggleUrlPath = model.showToggleUrlPath;
        state.defaultShowUrlPath = model.defaultShowUrlPath;
        state.defaultGroupByTagToEnabled = model.defaultGroupByTagToEnabled;
        state.defaultAllGroupTagsExpanded = model.defaultAllGroupTagsExpanded;
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}