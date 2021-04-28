import { ViewModelBinder } from "@paperbits/common/widgets";
import { ResetPasswordViewModel } from "./resetPasswordViewModel";
import { ResetPasswordModel } from "../resetPasswordModel";
import { Bag } from "@paperbits/common";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";

export class ResetPasswordViewModelBinder implements ViewModelBinder<ResetPasswordModel, ResetPasswordViewModel> {

    constructor(private readonly settingsProvider: ISettingsProvider) {}
    
    public async modelToViewModel(model: ResetPasswordModel, viewModel?: ResetPasswordViewModel, bindingContext?: Bag<any>): Promise<ResetPasswordViewModel> {
        if (!viewModel) {
            viewModel = new ResetPasswordViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Password: Reset form",
                model: model,
                flow: "block",
                draggale: true
            };
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        viewModel.runtimeConfig(JSON.stringify({ requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha }));

        return viewModel;
    }

    public canHandleModel(model: ResetPasswordModel): boolean {
        return model instanceof ResetPasswordModel;
    }
}