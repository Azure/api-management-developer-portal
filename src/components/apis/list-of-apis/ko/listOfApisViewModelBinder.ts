import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { StyleCompiler } from "@paperbits/common/styles";
import { TLayout } from "../../../utils/react/TableListInfo";

const layoutsMap = {
    "tiles": TLayout.cards,
    "list": TLayout.table,
    "dropdown": undefined, // TODO
}

export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ListOfApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            allowViewSwitching: state.allowViewSwitching,
            showApiType: state.showApiType,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            detailsPageUrl: state.detailsPageUrl,
            layoutDefault: layoutsMap[state.layout],
        }));
    }

    public async modelToState(model: ListOfApisModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;

        state.allowSelection = model.allowSelection,
        state.allowViewSwitching = model.allowViewSwitching,
        state.showApiType = model.showApiType,
        state.defaultGroupByTagToEnabled = model.defaultGroupByTagToEnabled,
        state.detailsPageUrl = model.detailsPageHyperlink
            ? model.detailsPageHyperlink.href
            : undefined

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}