import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";
import { ResetPasswordViewModelBinder } from "./ko/resetPasswordViewModelBinder";
import { ResetPasswordViewModel } from "./ko/resetPasswordViewModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { ResetPasswordModel } from "./resetPasswordModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";


export class ResetPasswordPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPassword", ResetPasswordViewModel);
        injector.bindSingleton("resetPasswordModelBinder", ResetPasswordModelBinder);
        injector.bindSingleton("resetPasswordViewModelBinder", ResetPasswordViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reset-password", {
            modelDefinition: ResetPasswordModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ResetPasswordViewModel,
            modelBinder: ResetPasswordModelBinder,
            viewModelBinder: ResetPasswordViewModelBinder
        });
    }
}