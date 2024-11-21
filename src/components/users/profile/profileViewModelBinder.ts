import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ProfileModel } from "./profileModel";
import { ProfileViewModel } from "./react/ProfileViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ProfileViewModelBinder implements ViewModelBinder<ProfileModel, ProfileViewModel> {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ProfileViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            styles: state.styles}));
    }

    public async modelToState(model: ProfileModel, state: WidgetState): Promise<void> {
        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}