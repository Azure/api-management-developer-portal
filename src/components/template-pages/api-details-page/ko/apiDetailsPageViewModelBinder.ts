import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ApiDetailsPageModel } from "../apiDetailsPageModel";
import { ApiDetailsPageViewModel } from "./apiDetailsPageViewModel";

export class ApiDetailsPageViewModelBinder implements ViewModelBinder<ApiDetailsPageModel, ApiDetailsPageViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance<TState, TInstance>(state: WidgetState, componentInstance: ApiDetailsPageViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.runtimeConfig(JSON.stringify({
            groupOperationsByTag: state.groupOperationsByTag,
            showUrlPath: state.showUrlPath,
            wrapText: state.wrapText,
            enableConsole: state.enableConsole,
            showExamples: state.showExamples,
            includeAllHostnames: state.includeAllHostnames,
            useCorsProxy: state.useCorsProxy,
            defaultSchemaView: state.defaultSchemaView
        }));
    }

    public async modelToState(model: ApiDetailsPageModel, state: WidgetState): Promise<void> {
        state.groupOperationsByTag = model.groupOperationsByTag;
        state.showUrlPath = model.showUrlPath;
        state.wrapText = model.wrapText;
        state.enableConsole = model.enableConsole;
        state.showExamples = model.showExamples;
        state.includeAllHostnames = model.includeAllHostnames;
        state.useCorsProxy = model.useCorsProxy;
        state.defaultSchemaView = model.defaultSchemaView;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}