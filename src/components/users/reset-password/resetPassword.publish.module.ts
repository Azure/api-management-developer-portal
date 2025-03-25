import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";
import { ResetPasswordViewModel } from "./react/ResetPasswordViewModel";
import { ResetPasswordViewModelBinder } from "./resetPasswordViewModelBinder";

export class ResetPasswordPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPassword", ResetPasswordViewModel);
        injector.bindSingleton("resetPasswordModelBinder", ResetPasswordModelBinder);
        injector.bindSingleton("resetPasswordViewModelBinder", ResetPasswordViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reset-password", {
            modelDefinition: ResetPasswordModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ResetPasswordViewModel,
            modelBinder: ResetPasswordModelBinder,
            viewModelBinder: ResetPasswordViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}