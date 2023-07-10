import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordModelBinder } from "../confirmPasswordModelBinder";
import { ConfirmPasswordViewModelBinder } from "./confirmPasswordViewModelBinder";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordHandlers } from "../confirmPasswordHandlers";
import { IWidgetService } from "@paperbits/common/widgets";

export class ConfirmPasswordPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("confirmPasswordModelBinder", ConfirmPasswordModelBinder);
        injector.bindSingleton("confirmPasswordViewModelBinder", ConfirmPasswordViewModelBinder)
        injector.bindSingleton("confirmPasswordHandlers", ConfirmPasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("confirmPassword", {
            modelDefinition: ConfirmPasswordModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ConfirmPasswordViewModel,
            modelBinder: ConfirmPasswordModelBinder,
            viewModelBinder: ConfirmPasswordViewModelBinder
        });
    }
}