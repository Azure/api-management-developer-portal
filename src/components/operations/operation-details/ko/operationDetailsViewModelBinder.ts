import { ViewModelBinder } from "@paperbits/common/widgets";
import { OperationDetailsViewModel } from "./operationDetailsViewModel";
import { OperationDetailsModel } from "../operationDetailsModel";
import { Bag } from "@paperbits/common";

export class OperationDetailsViewModelBinder implements ViewModelBinder<OperationDetailsModel, OperationDetailsViewModel> {
    public async modelToViewModel(model: OperationDetailsModel, viewModel?: OperationDetailsViewModel, bindingContext?: Bag<any>): Promise<OperationDetailsViewModel> {
        if (!viewModel) {
            viewModel = new OperationDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "Operation: Details",
            model: model,
            editor: "operation-details-editor",
            applyChanges: async (updatedModel: OperationDetailsModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: OperationDetailsModel): boolean {
        return model instanceof OperationDetailsModel;
    }
}