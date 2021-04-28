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
            viewModel["widgetBinding"] = {
                displayName: "Password: Change form",
                model: model,
                flow: "block",
                draggable: true
            };
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        viewModel.runtimeConfig(JSON.stringify({ requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha }));

        return viewModel;
    }

    public canHandleModel(model: ChangePasswordModel): boolean {
        return model instanceof ChangePasswordModel;
    }
}