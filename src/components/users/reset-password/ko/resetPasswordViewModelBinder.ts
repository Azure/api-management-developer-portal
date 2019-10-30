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
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        viewModel.runtimeConfig(JSON.stringify({ requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha }));

        viewModel["widgetBinding"] = {
            displayName: "Reset password",
            model: model,
            // editor: "reset-password-editor",
            // applyChanges: async (updatedModel: ResetPasswordModel) => {
            //     await this.modelToViewModel(updatedModel, viewModel, bindingContext);
            //     this.eventManager.dispatchEvent("onContentUpdate");
            // }
        };

        return viewModel;
    }

    public canHandleModel(model: ResetPasswordModel): boolean {
        return model instanceof ResetPasswordModel;
    }
}