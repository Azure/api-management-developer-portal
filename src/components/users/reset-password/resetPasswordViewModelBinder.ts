import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites/ISiteService";
import { isRedesignEnabledSetting } from "../../../constants";
import { ResetPasswordViewModel } from "./react/ResetPasswordViewModel";

export class ResetPasswordViewModelBinder implements ViewModelBinder<ResetPasswordModel, ResetPasswordViewModel> {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ResetPasswordViewModel): void {
        componentInstance.setState(prevState => ({
            isRedesignEnabled: state.isRedesignEnabled,
            requireHipCaptcha: state.requireHipCaptcha,
            styles: state.styles}));

    }

    public async modelToState(model: ResetPasswordModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        state.requireHipCaptcha = useHipCaptcha ?? true;
        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}