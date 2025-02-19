import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ChangePasswordHandlers } from "./changePasswordHandlers";
import { ChangePasswordEditor } from "./react/ChangePasswordEditor";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordModelBinder } from "./changePasswordModelBinder";
import { ChangePasswordViewModel } from "./react/ChangePasswordViewModel";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";

export class ChangePasswordDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("changePasswordEditor", ChangePasswordEditor);
        injector.bindSingleton("changePasswordModelBinder", ChangePasswordModelBinder);
        injector.bindSingleton("changePasswordViewModelBinder", ChangePasswordViewModelBinder)
        injector.bindSingleton("changePasswordHandlers", ChangePasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("change-password", {
            modelDefinition: ChangePasswordModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ChangePasswordViewModel,
            modelBinder: ChangePasswordModelBinder,
            viewModelBinder: ChangePasswordViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("change-password", {
            displayName: "Password: Change form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: ReactComponentBinder,
            componentDefinition: ChangePasswordEditor,
            handlerComponent: ChangePasswordHandlers
        });
    }
}