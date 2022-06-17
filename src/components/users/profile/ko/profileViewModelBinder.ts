import { Bag } from "@paperbits/common";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/editing";
import { ProfileViewModel } from "./profileViewModel";
import { ProfileModel } from "../profileModel";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ProfileHandlers } from "../profileHandlers";


export class ProfileViewModelBinder implements ViewModelBinder<ProfileModel, ProfileViewModel> {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ProfileModel, viewModel?: ProfileViewModel, bindingContext?: Bag<any>): Promise<ProfileViewModel> {
        if (!viewModel) {
            viewModel = new ProfileViewModel();

            viewModel["widgetBinding"] = {
                displayName: "User: Profile",
                layer: bindingContext?.layer,
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                handler: ProfileHandlers,
                applyChanges: async (updatedModel: ProfileModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);

                }
            };
        }

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ProfileHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ProfileModel): boolean {
        return model instanceof ProfileModel;
    }
}