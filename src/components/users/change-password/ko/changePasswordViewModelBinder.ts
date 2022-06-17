import { ViewModelBinder } from "@paperbits/common/widgets";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordModel } from "../changePasswordModel";
import { Bag } from "@paperbits/common";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ComponentFlow } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ChangePasswordHandlers } from "../changePasswordHandlers";

export class ChangePasswordViewModelBinder implements ViewModelBinder<ChangePasswordModel, ChangePasswordViewModel> {

    constructor(
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider,
        private readonly styleCompiler: StyleCompiler) { }

    public async modelToViewModel(model: ChangePasswordModel, viewModel?: ChangePasswordViewModel, bindingContext?: Bag<any>): Promise<ChangePasswordViewModel> {
        if (!viewModel) {
            viewModel = new ChangePasswordViewModel();
            viewModel["widgetBinding"] = {
                displayName: "Password: Change form",
                layer: bindingContext?.layer,
                model: model,
                flow: ComponentFlow.Block,
                draggable: true,
                handler: ChangePasswordHandlers,
                applyChanges: async (updatedModel: ChangePasswordModel) => {
                    this.modelToViewModel(updatedModel, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };
        }

        const useHipCaptcha = await this.settingsProvider.getSetting<boolean>("useHipCaptcha");

        viewModel.runtimeConfig(JSON.stringify({ requireHipCaptcha: useHipCaptcha === undefined ? true : useHipCaptcha }));

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager, ChangePasswordHandlers));
        }

        return viewModel;
    }

    public canHandleModel(model: ChangePasswordModel): boolean {
        return model instanceof ChangePasswordModel;
    }
}