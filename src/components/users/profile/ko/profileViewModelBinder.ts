import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProfileModel } from "../profileModel";
import { ProfileViewModel } from "./profileViewModel";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { isRedesignEnabledSetting } from "../../../../constants";


export class ProfileViewModelBinder implements ViewModelBinder<ProfileModel, ProfileViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProfileViewModel): void {
        componentInstance.styles(state.styles);

        componentInstance.isRedesignEnabled(state.isRedesignEnabled);
    }

    public async modelToState(model: ProfileModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}