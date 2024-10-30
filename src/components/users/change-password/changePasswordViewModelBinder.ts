import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordViewModel } from "./react/ChangePasswordViewModel";
import { isRedesignEnabledSetting } from "../../../constants";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ChangePasswordViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            requireHipCaptcha: state.requireHipCaptcha,
            styles: state.styles}));
    }

    public async modelToState(model: ChangePasswordModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        state.requireHipCaptcha = useHipCaptcha ?? true;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}