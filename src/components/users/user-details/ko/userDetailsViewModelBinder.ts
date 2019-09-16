import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserDetailsViewModel } from "./userDetailsViewModel";
import { UserDetailsModel } from "../userDetailsModel";
import { Bag } from "@paperbits/common";

export class UserDetailsViewModelBinder implements ViewModelBinder<UserDetailsModel, UserDetailsViewModel> {
    public async modelToViewModel(model: UserDetailsModel, viewModel?: UserDetailsViewModel, bindingContext?: Bag<any>): Promise<UserDetailsViewModel> {
        if (!viewModel) {
            viewModel = new UserDetailsViewModel();
        }

        viewModel["widgetBinding"] = {
            displayName: "User: Profile",
            model: model,
            applyChanges: async (updatedModel: UserDetailsModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
            }
        };

        return viewModel;
    }

    public canHandleModel(model: UserDetailsModel): boolean {
        return model instanceof UserDetailsModel;
    }
}