import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ISiteService } from "@paperbits/common/sites";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ChangePasswordModel } from "../changePasswordModel";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { isRedesignEnabledSetting } from "../../../../constants";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly styleCompiler: StyleCompiler,
        private readonly siteService: ISiteService,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: ChangePasswordViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.isRedesignEnabled(state.isRedesignEnabled);

        componentInstance.runtimeConfig(JSON.stringify({
            requireHipCaptcha: state.requireHipCaptcha
        }));
    }

    public async modelToState(model: ChangePasswordModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        state.requireHipCaptcha = useHipCaptcha === undefined ? true : useHipCaptcha;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }

        state.isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
    }
}