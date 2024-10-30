import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordHandlers } from "./confirmPasswordHandlers";
import { ConfirmPasswordModelBinder } from "./confirmPasswordModelBinder";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ConfirmPasswordViewModel } from "./react/ConfirmPasswordViewModel";
import { ConfirmPasswordViewModelBinder } from "./confirmPasswordViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";

export class ConfirmPasswordDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("confirmPasswordModelBinder", ConfirmPasswordModelBinder);
        injector.bindSingleton("confirmPasswordViewModelBinder", ConfirmPasswordViewModelBinder)
        injector.bindSingleton("confirmPasswordHandlers", ConfirmPasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("confirmPassword", {
            modelDefinition: ConfirmPasswordModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ConfirmPasswordViewModel,
            modelBinder: ConfirmPasswordModelBinder,
            viewModelBinder: ConfirmPasswordViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("confirmPassword", {
            displayName: "Password: Confirmation form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ConfirmPasswordHandlers
        });
    }
}