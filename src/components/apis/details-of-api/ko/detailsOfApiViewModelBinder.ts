import { ViewModelBinder } from "@paperbits/common/widgets";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { Bag } from "@paperbits/common";


export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    public async modelToViewModel(model: DetailsOfApiModel, viewModel?: DetailsOfApiViewModel, bindingContext?: Bag<any>): Promise<DetailsOfApiViewModel> {
        if (!viewModel) {
            viewModel = new DetailsOfApiViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "API: Details",
            model: model,
            editor: "details-of-api-editor",
            applyChanges: async (updatedModel: DetailsOfApiModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: DetailsOfApiModel): boolean {
        return model instanceof DetailsOfApiModel;
    }
}