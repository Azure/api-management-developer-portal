import { ViewModelBinder } from "@paperbits/common/widgets";
import { OperationListViewModel } from "./operationListViewModel";
import { OperationListModel } from "../operationListModel";
import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow } from "@paperbits/common/editing";
import { OperationListHandlers } from "../operationListHandlers";
import { StyleCompiler } from "@paperbits/common/styles";

export class OperationListViewModelBinder implements ViewModelBinder<OperationListModel, OperationListViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: OperationListModel, viewModel?: OperationListViewModel, bindingContext?: Bag<any>): Promise<OperationListViewModel> {
        if (!viewModel) {
            viewModel = new OperationListViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            allowSelection: model.allowSelection,
            wrapText: model.wrapText,
            showToggleUrlPath: model.showToggleUrlPath,
            defaultShowUrlPath: model.defaultShowUrlPath,
            defaultGroupByTagToEnabled: model.defaultGroupByTagToEnabled,
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "List of operations",
            layer: bindingContext?.layer,
            model: model,
            draggable: true,
            handler: OperationListHandlers,
            flow: ComponentFlow.Block,
            editor: "operation-list-editor",
            applyChanges: async (updatedModel: OperationListModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, OperationListHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: OperationListModel): boolean {
        return model instanceof OperationListModel;
    }
}