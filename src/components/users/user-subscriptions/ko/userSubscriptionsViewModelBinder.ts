import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserSubscriptionsViewModel } from "./userSubscriptionsViewModel";
import { UserSubscriptionsModel } from "../userSubscriptionsModel";
import { Bag } from "@paperbits/common";

export class UserSubscriptionsViewModelBinder implements ViewModelBinder<UserSubscriptionsModel, UserSubscriptionsViewModel> {
    public async modelToViewModel(model: UserSubscriptionsModel, viewModel?: UserSubscriptionsViewModel, bindingContext?: Bag<any>): Promise<UserSubscriptionsViewModel> {
        if (!viewModel) {
            viewModel = new UserSubscriptionsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "User subscriptions",
            model: model,
            applyChanges: async (updatedModel: UserSubscriptionsModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model,  viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserSubscriptionsModel): boolean {
        return model instanceof UserSubscriptionsModel;
    }
}