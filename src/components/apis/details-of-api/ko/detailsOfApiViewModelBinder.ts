import { ViewModelBinder } from "@paperbits/common/widgets";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";


export class DetailsOfApiViewModelBinder implements ViewModelBinder<DetailsOfApiModel, DetailsOfApiViewModel> {
    
    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: DetailsOfApiModel, viewModel?: DetailsOfApiViewModel, bindingContext?: Bag<any>): Promise<DetailsOfApiViewModel> {
        if (!viewModel) {
            viewModel = new DetailsOfApiViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            changeLogPageUrl: model.changeLogPageHyperlink
                ? model.changeLogPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "API: details",
            model: model,
            draggable: true,
            editor: "details-of-api-editor",
            applyChanges: async (updatedModel: DetailsOfApiModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: DetailsOfApiModel): boolean {
        return model instanceof DetailsOfApiModel;
    }
}