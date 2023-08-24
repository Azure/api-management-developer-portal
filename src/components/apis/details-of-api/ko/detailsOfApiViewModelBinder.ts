import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";


export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: DetailsOfApiViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            changeLogPageUrl: state.changeLogPageHyperlink
                ? state.changeLogPageHyperlink.href
                : undefined
        }));
    }

    public async modelToState(model: DetailsOfApiModel, state: WidgetState): Promise<void> {
        state.changeLogPageHyperlink = model.changeLogPageHyperlink;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}