import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordModelBinder } from "./confirmPasswordModelBinder";
import { ConfirmPasswordViewModelBinder } from "./confirmPasswordViewModelBinder";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ConfirmPasswordViewModel } from "./react/ConfirmPasswordViewModel";
import { ConfirmPasswordHandlers } from "./confirmPasswordHandlers";
import { IWidgetService } from "@paperbits/common/widgets";
import { ComponentFlow } from "@paperbits/common/components";

export class ConfirmPasswordPublishModule implements IInjectorModule {
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
    }
}