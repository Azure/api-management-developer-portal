import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserSubscriptionsViewModel } from "./userSubscriptionsViewModel";
import { UserSubscriptionsModel } from "../userSubscriptionsModel";

export class UserSubscriptionsViewModelBinder implements IViewModelBinder<UserSubscriptionsModel, UserSubscriptionsViewModel> {
    public modelToViewModel(model: UserSubscriptionsModel, readonly: boolean, viewModel?: UserSubscriptionsViewModel): UserSubscriptionsViewModel {
        if (!viewModel) {
            viewModel = new UserSubscriptionsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "User subscriptions",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: UserSubscriptionsModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: UserSubscriptionsModel): boolean {
        return model instanceof UserSubscriptionsModel;
    }
}