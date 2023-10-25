import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ReportsViewModel } from "./reportsViewModel";
import { ReportsModel } from "../reportsModel";
import { StyleCompiler } from "@paperbits/common/styles";

export class ReportsViewModelBinder implements ViewModelBinder<ReportsModel, ReportsViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ReportsViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: ReportsModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}