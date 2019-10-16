import { ViewModelBinder } from "@paperbits/common/widgets";
import { ListOfApisViewModel } from "./listOfApisViewModel";
import { ListOfApisModel } from "../listOfApisModel";
import { Bag } from "@paperbits/common";
import { IEventManager } from "@paperbits/common/events/IEventManager";


export class ListOfApisViewModelBinder implements ViewModelBinder<ListOfApisModel, ListOfApisViewModel> {

    constructor(private readonly eventManager: IEventManager) {}
    
    public async modelToViewModel(model: ListOfApisModel, viewModel?: ListOfApisViewModel, bindingContext?: Bag<any>): Promise<ListOfApisViewModel> {
        if (!viewModel) {
            viewModel = new ListOfApisViewModel();
        }

        viewModel.itemStyleView(model.itemStyleView);

        viewModel["widgetBinding"] = {
            displayName: "List of APIs",
            model: model,
            editor: "list-of-apis-editor",
            applyChanges: async (updatedModel: ListOfApisModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ListOfApisModel): boolean {
        return model instanceof ListOfApisModel;
    }
}