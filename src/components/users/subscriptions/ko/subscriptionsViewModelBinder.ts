import { ViewModelBinder } from "@paperbits/common/widgets";
import { SubscriptionsViewModel } from "./subscriptionsViewModel";
import { SubscriptionsModel } from "../subscriptionsModel";
import { Bag } from "@paperbits/common";


export class SubscriptionsViewModelBinder implements ViewModelBinder<SubscriptionsModel, SubscriptionsViewModel> {
    public async modelToViewModel(model: SubscriptionsModel, viewModel?: SubscriptionsViewModel, bindingContext?: Bag<any>): Promise<SubscriptionsViewModel> {
        if (!viewModel) {
            viewModel = new SubscriptionsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "User: Subscriptions",
                model: model,
                flow: "block",
                draggable: true,
                applyChanges: async (updatedModel: SubscriptionsModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                }
            };
        }

        return viewModel;
    }

    public canHandleModel(model: SubscriptionsModel): boolean {
        return model instanceof SubscriptionsModel;
    }
}