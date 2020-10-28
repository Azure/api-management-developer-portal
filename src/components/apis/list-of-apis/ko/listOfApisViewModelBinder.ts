import { ViewModelBinder } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";


export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {

    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: ListOfApisModel, viewModel?: ListOfApisViewModel, bindingContext?: Bag<any>): Promise<ListOfApisViewModel> {
        if (!viewModel) {
            viewModel = new ListOfApisViewModel();
        }

        viewModel.layout(model.layout);

        viewModel.runtimeConfig(JSON.stringify({
            allowSelection: model.allowSelection,
            defaultGroupByTagToEnabled: model.defaultGroupByTagToEnabled,
            detailsPageUrl: model.detailsPageHyperlink
                ? model.detailsPageHyperlink.href
                : undefined
        }));

        viewModel["widgetBinding"] = {
            displayName: "List of APIs",
            model: model,
            draggable: true,
            editor: "list-of-apis-editor",
            applyChanges: async (updatedModel: ListOfApisModel) => {
                await this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ListOfApisModel): boolean {
        return model instanceof ListOfApisModel;
    }
}