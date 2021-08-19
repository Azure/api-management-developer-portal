import { ViewModelBinder } from "@paperbits/common/widgets";
import { HistoryOfApiViewModel } from "./historyOfApiViewModel";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";


export class HistoryOfApiViewModelBinder implements ViewModelBinder<HistoryOfApiModel, HistoryOfApiViewModel> {
    
    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: HistoryOfApiModel, viewModel?: HistoryOfApiViewModel, bindingContext?: Bag<any>): Promise<HistoryOfApiViewModel> {
        if (!viewModel) {
            viewModel = new HistoryOfApiViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "API: Change history",
            model: model,
            draggable: true,
            flow: "block",
            editor: "history-of-api-editor",
            applyChanges: async (updatedModel: HistoryOfApiModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: HistoryOfApiModel): boolean {
        return model instanceof HistoryOfApiModel;
    }
}