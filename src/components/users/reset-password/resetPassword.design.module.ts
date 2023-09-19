import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ResetPasswordEditor } from "./ko/resetPasswordEditor";
import { ResetPasswordViewModel } from "./ko/resetPasswordViewModel";
import { ResetPasswordViewModelBinder } from "./ko/resetPasswordViewModelBinder";
import { ResetPasswordHandlers } from "./resetPasswordHandlers";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";


export class ResetPasswordDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPasswordEditor", ResetPasswordEditor);
        injector.bindSingleton("resetPasswordModelBinder", ResetPasswordModelBinder);
        injector.bindSingleton("resetPasswordViewModelBinder", ResetPasswordViewModelBinder)
        injector.bindSingleton("resetPasswordHandlers", ResetPasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reset-password", {
            modelDefinition: ResetPasswordModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ResetPasswordViewModel,
            modelBinder: ResetPasswordModelBinder,
            viewModelBinder: ResetPasswordViewModelBinder
        });

        widgetService.registerWidgetEditor("reset-password", {
            displayName: "Password: Reset form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ResetPasswordEditor,
            handlerComponent: ResetPasswordHandlers
        });
    }
}