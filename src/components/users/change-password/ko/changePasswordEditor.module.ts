import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ChangePasswordHandlers } from "../changePasswordHandlers";
import { ChangePasswordModel } from "../changePasswordModel";
import { ChangePasswordModelBinder } from "../changePasswordModelBinder";
import { ChangePasswordEditor } from "./changePasswordEditor";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";


export class ChangePasswordEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("changePasswordEditor", ChangePasswordEditor);
        injector.bindSingleton("changePasswordModelBinder", ChangePasswordModelBinder);
        injector.bindSingleton("changePasswordViewModelBinder", ChangePasswordViewModelBinder)
        injector.bindSingleton("changePasswordHandlers", ChangePasswordHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("change-password", {
            modelDefinition: ChangePasswordModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ChangePasswordViewModel,
            modelBinder: ChangePasswordModelBinder,
            viewModelBinder: ChangePasswordViewModelBinder
        });

        widgetService.registerWidgetEditor("change-password", {
            displayName: "Password: Change form",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ChangePasswordEditor,
            handlerComponent: ChangePasswordHandlers
        });
    }
}