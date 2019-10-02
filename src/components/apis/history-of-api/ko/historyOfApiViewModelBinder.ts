import { ViewModelBinder } from "@paperbits/common/widgets";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { Bag } from "@paperbits/common";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {
    public async modelToViewModel(model: HistoryOfApiModel, viewModel?: HistoryOfApiViewModel, bindingContext?: Bag<any>): Promise<HistoryOfApiViewModel> {
        if (!viewModel) {
            viewModel = new HistoryOfApiViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "API History",
            model: model,
            editor: "history-of-api-editor",
            applyChanges: async (updatedModel: HistoryOfApiModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: HistoryOfApiModel): boolean {
        return model instanceof HistoryOfApiModel;
    }
}