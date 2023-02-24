import { ViewModelBinder } from "@paperbits/common/widgets";
import { EventManager, Events } from "@paperbits/common/events";
import { OperationDetailsViewModel } from "./operationDetailsViewModel";
import { OperationDetailsModel } from "../operationDetailsModel";
import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { OperationDetailsHandlers } from "../operationDetailsHandlers";
import { StyleCompiler } from "@paperbits/common/styles";

export class OperationDetailsViewModelBinder implements ViewModelBinder<OperationDetailsModel, OperationDetailsViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler
    ) { }

    public async modelToViewModel(model: OperationDetailsModel, viewModel?: OperationDetailsViewModel, bindingContext?: Bag<any>): Promise<OperationDetailsViewModel> {
        if (!viewModel) {
            viewModel = new OperationDetailsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "Operation: Details",
                layer: bindingContext?.layer,
                model: model,
                draggable: true,
                handler: OperationDetailsHandlers,
                flow: ComponentFlow.Block,
                editor: "operation-details-editor",
                applyChanges: async (updatedModel: OperationDetailsModel) => {
                    await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        const runtimeConfig = {
            enableConsole: model.enableConsole,
            enableScrollTo: model.enableScrollTo,
            defaultSchemaView: model.defaultSchemaView,
            useCorsProxy: model.useCorsProxy,
            includeAllHostnames: model.includeAllHostnames,
            showExamples: model.showExamples,
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, OperationDetailsHandlers));
        }

        viewModel.config(JSON.stringify(runtimeConfig));

        return viewModel;
    }

    public canHandleModel(model: OperationDetailsModel): boolean {
        return model instanceof OperationDetailsModel;
    }
}