import { IViewModelBinder } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";


export class ListOfApisViewModelBinder implements IViewModelBinder<ListOfApisModel, ListOfApisViewModel> {
    public modelToViewModel(model: ListOfApisModel, readonly: boolean, viewModel?: ListOfApisViewModel): ListOfApisViewModel {
        if (!viewModel) {
            viewModel = new ListOfApisViewModel();
        }

        viewModel["widgetBinding"] = {
            name: "List of APIs",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: ListOfApisModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: ListOfApisModel): boolean {
        return model instanceof ListOfApisModel;
    }
}