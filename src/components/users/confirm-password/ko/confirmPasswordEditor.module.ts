import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordHandlers } from "../confirmPasswordHandlers";
import { ConfirmPasswordModelBinder } from "../confirmPasswordModelBinder";
import { ConfirmPasswordModel } from "../confirmPasswordModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ConfirmPasswordViewModel } from "./confirmPasswordViewModel";
import { ConfirmPasswordViewModelBinder } from "./confirmPasswordViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";


export class ConfirmPasswordEditorModule implements IInjectorModule {
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

        widgetService.registerWidgetEditor("confirmPassword", {
            displayName: "Password: Confirmation form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ConfirmPasswordHandlers
        });
    }
}