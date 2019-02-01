import { IViewModelBinder } from "@paperbits/common/widgets";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { DetailsOfApiModel } from "../detailsOfApiModel";


export class DetailsOfApiViewModelBinder implements IViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    public modelToViewModel(model: DetailsOfApiModel, readonly: boolean, viewModel?: DetailsOfApiViewModel): DetailsOfApiViewModel {
        if (!viewModel) {
            viewModel = new DetailsOfApiViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "List of APIs",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: DetailsOfApiModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: DetailsOfApiModel): boolean {
        return model instanceof DetailsOfApiModel;
    }
}