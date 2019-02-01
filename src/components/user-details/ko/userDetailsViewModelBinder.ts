import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserDetailsViewModel } from "./userDetailsViewModel";
import { UserDetailsModel } from "../userDetailsModel";

export class UserDetailsViewModelBinder implements IViewModelBinder<UserDetailsModel, UserDetailsViewModel> {
    public modelToViewModel(model: UserDetailsModel, readonly: boolean, viewModel?: UserDetailsViewModel): UserDetailsViewModel {
        if (!viewModel) {
            viewModel = new UserDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "User profile",
            readonly: readonly,
            model: model,
            applyChanges: async (updatedModel: UserDetailsModel) => {
                Object.assign(model, updatedModel);
                this.modelToViewModel(model, readonly, viewModel);
            }
        }

        return viewModel;
    }

    public canHandleModel(model: UserDetailsModel): boolean {
        return model instanceof UserDetailsModel;
    }
}