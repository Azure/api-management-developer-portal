import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { StyleCompiler } from "@paperbits/common/styles";


export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ListOfApisViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.layout(state.layout);

        componentInstance.runtimeConfig(JSON.stringify({
            allowSelection: state.allowSelection,
            showApiType: state.showApiType,
            defaultGroupByTagToEnabled: state.defaultGroupByTagToEnabled,
            detailsPageUrl: state.detailsPageUrl
        }));
    }

    public async modelToState(model: ListOfApisModel, state: WidgetState): Promise<void> {
        state.layout = model.layout;

        state.allowSelection = model.allowSelection,
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