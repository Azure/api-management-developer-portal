import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";
import { ResetPasswordViewModelBinder } from "./resetPasswordViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ResetPasswordViewModel } from "./react/ResetPasswordViewModel";


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
            viewModelBinder: ResetPasswordViewModelBinder
        });
    }
}