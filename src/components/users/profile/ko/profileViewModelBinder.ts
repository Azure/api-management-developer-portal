import { Bag } from "@paperbits/common";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/editing";
import { ProfileViewModel } from "./profileViewModel";
import { ProfileModel } from "../profileModel";


export class ProfileViewModelBinder implements ViewModelBinder<ProfileModel, ProfileViewModel> {
    public async modelToViewModel(model: ProfileModel, viewModel?: ProfileViewModel, bindingContext?: Bag<any>): Promise<ProfileViewModel> {
        if (!viewModel) {
            viewModel = new ProfileViewModel();
            
            viewModel["widgetBinding"] = {
                displayName: "User: Profile",
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                applyChanges: async (updatedModel: ProfileModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                }
            };
        }

        return viewModel;
    }

    public canHandleModel(model: ProfileModel): boolean {
        return model instanceof ProfileModel;
    }
}