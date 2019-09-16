import { ViewModelBinder } from "@paperbits/common/widgets";
import { OperationListViewModel } from "./operationListViewModel";
import { OperationListModel } from "../operationListModel";
import { Bag } from "@paperbits/common";

export class OperationListViewModelBinder implements ViewModelBinder<OperationListModel, OperationListViewModel> {
    public async modelToViewModel(model: OperationListModel, viewModel?: OperationListViewModel, bindingContext?: Bag<any>): Promise<OperationListViewModel> {
        if (!viewModel) {
            viewModel = new OperationListViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "List of operations",
            model: model,
            editor: "operation-list-editor",
            applyChanges: async (updatedModel: OperationListModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: OperationListModel): boolean {
        return model instanceof OperationListModel;
    }
}