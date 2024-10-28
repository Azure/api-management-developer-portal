import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ResetPasswordViewModelBinder } from "./resetPasswordViewModelBinder";
import { ResetPasswordHandlers } from "./resetPasswordHandlers";
import { ResetPasswordModel } from "./resetPasswordModel";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ResetPasswordEditor } from "./react/ResetPasswordEditor";
import { ResetPasswordViewModel } from "./react/ResetPasswordViewModel";
import { ComponentFlow } from "@paperbits/common/components";

export class ResetPasswordDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPasswordEditor", ResetPasswordEditor);
        injector.bindSingleton("resetPasswordModelBinder", ResetPasswordModelBinder);
        injector.bindSingleton("resetPasswordViewModelBinder", ResetPasswordViewModelBinder)
        injector.bindSingleton("resetPasswordHandlers", ResetPasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("reset-password", {
            modelDefinition: ResetPasswordModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ResetPasswordViewModel,
            modelBinder: ResetPasswordModelBinder,
            viewModelBinder: ResetPasswordViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("reset-password", {
            displayName: "Password: Reset form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: ReactComponentBinder,
            componentDefinition: ResetPasswordEditor,
            handlerComponent: ResetPasswordHandlers
        });
    }
}