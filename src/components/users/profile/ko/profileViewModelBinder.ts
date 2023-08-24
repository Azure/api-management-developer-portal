import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProfileModel } from "../profileModel";
import { ProfileViewModel } from "./profileViewModel";


export class ProfileViewModelBinder implements ViewModelBinder<ProfileModel, ProfileViewModel> {
    constructor(private readonly styleCompiler: StyleCompiler) { }

    public stateToInstance(state: WidgetState, componentInstance: ProfileViewModel): void {
        componentInstance.styles(state.styles);
    }

    public async modelToState(model: ProfileModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}