import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { StyleCompiler } from "@paperbits/common/styles";
import { layoutsMap } from "../../../utils/react/TableListInfo";

export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ListOfApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
            filtersInSidebar: state.filtersInSidebar,
            showApiType: state.showApiType,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            layoutDefault: layoutsMap[state.layout],
            detailsPageUrl: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.href
                : undefined,
            detailsPageTarget: state.detailsPageHyperlink
                ? state.detailsPageHyperlink.target
                : undefined,
        }));
    }

    public async modelToState(model: ListOfApisModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;

        state.allowSelection = model.allowSelection;
        state.allowViewSwitching = model.allowViewSwitching;
        state.filtersInSidebar = model.filtersInSidebar;
        state.showApiType = model.showApiType;
        state.defaultGroupByTagToEnabled = model.defaultGroupByTagToEnabled;
        state.detailsPageHyperlink = model.detailsPageHyperlink;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}