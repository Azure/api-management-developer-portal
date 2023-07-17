import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ChangePasswordModel } from "../changePasswordModel";
import { ChangePasswordModelBinder } from "../changePasswordModelBinder";
import { ChangePasswordViewModel } from "./changePasswordViewModel";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";


export class ChangePasswordPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("changePasswordModelBinder", ChangePasswordModelBinder);
        injector.bindSingleton("changePasswordViewModelBinder", ChangePasswordViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("change-password", {
            modelDefinition: ChangePasswordModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ChangePasswordViewModel,
            modelBinder: ChangePasswordModelBinder,
            viewModelBinder: ChangePasswordViewModelBinder
        });
    }
}