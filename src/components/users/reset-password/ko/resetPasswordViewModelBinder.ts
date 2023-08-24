import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { ResetPasswordViewModel } from "./resetPasswordViewModel";
import { ResetPasswordModel } from "../resetPasswordModel";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class ResetPasswordViewModelBinder implements ViewModelBinder<ResetPasswordModel, ResetPasswordViewModel> {
    constructor(private readonly settingsProvider: ISettingsProvider) {}

    public stateToInstance(state: WidgetState, componentInstance: ResetPasswordViewModel): void {
        componentInstance.runtimeConfig(JSON.stringify({
            requireHipCaptcha: state.useHipCaptcha === undefined ? true : state.useHipCaptcha
        }));
    }

    public async modelToState(model: ResetPasswordModel, state: WidgetState): Promise<void> {
        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");
        state.requireHipCaptcha = useHipCaptcha;
    }
}