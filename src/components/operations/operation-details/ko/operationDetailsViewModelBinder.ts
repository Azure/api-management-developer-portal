import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { OperationDetailsViewModel } from "./operationDetailsViewModel";
import { OperationDetailsModel } from "../operationDetailsModel";
import { StyleCompiler } from "@paperbits/common/styles";

export class OperationDetailsViewModelBinder implements ViewModelBinder<OperationDetailsModel, OperationDetailsViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: OperationDetailsViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.config(JSON.stringify({
            enableConsole: state.enableConsole,
            enableScrollTo: state.enableScrollTo,
            defaultSchemaView: state.defaultSchemaView,
            useCorsProxy: state.useCorsProxy,
            includeAllHostnames: state.includeAllHostnames,
            showExamples: state.showExamples
        }));
    }

    public async modelToState(model: OperationDetailsModel, state: WidgetState): Promise<void> {
        state.enableConsole = model.enableConsole;
        state.enableScrollTo = model.enableScrollTo;
        state.defaultSchemaView = model.defaultSchemaView;
        state.useCorsProxy = model.useCorsProxy;
        state.includeAllHostnames = model.includeAllHostnames;
        state.showExamples = model.showExamples;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}