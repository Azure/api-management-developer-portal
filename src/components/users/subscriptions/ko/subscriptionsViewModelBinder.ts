import { Bag } from "@paperbits/common";
import { ComponentFlow } from "@paperbits/common/editing";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { SubscriptionsModel } from "../subscriptionsModel";
import { SubscriptionsViewModel } from "./subscriptionsViewModel";


export class SubscriptionsViewModelBinder implements ViewModelBinder<SubscriptionsModel, SubscriptionsViewModel> {
    public async modelToViewModel(model: SubscriptionsModel, viewModel?: SubscriptionsViewModel, bindingContext?: Bag<any>): Promise<SubscriptionsViewModel> {
        if (!viewModel) {
            viewModel = new SubscriptionsViewModel();

            viewModel["widgetBinding"] = {
                displayName: "User: Subscriptions",
                model: model,
                flow: ComponentFlow.Block,
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