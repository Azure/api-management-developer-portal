import { ViewModelBinder } from "@paperbits/common/widgets";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordModel } from "../changePasswordModel";
import { Bag } from "@paperbits/common";
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {

    constructor(private readonly settingsProvider: ISettingsProvider) {}
    
    public async modelToViewModel(model: ChangePasswordModel, viewModel?: ChangePasswordViewModel, bindingContext?: Bag<any>): Promise<ChangePasswordViewModel> {
        if (!viewModel) {
            viewModel = new ChangePasswordViewModel();
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        viewModel.runtimeConfig(JSON.stringify({ requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha }));

        viewModel["widgetBinding"] = {
            displayName: "Change password",
            model: model,
            // editor: "change-password-editor",
            // applyChanges: async (updatedModel: ChangePasswordModel) => {
            //     await this.modelToViewModel(updatedModel, viewModel, bindingContext);
            //     this.eventManager.dispatchEvent("onContentUpdate");
            // }
        };

        return viewModel;
    }

    public canHandleModel(model: ChangePasswordModel): boolean {
        return model instanceof ChangePasswordModel;
    }
}