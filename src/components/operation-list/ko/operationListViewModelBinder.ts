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
            displayName: "Operation list",
            model: model,
            editor: "operation-list-editor",
            applyChanges: async (updatedModel: OperationListModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: OperationListModel): boolean {
        return model instanceof OperationListModel;
    }
}