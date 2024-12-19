import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ChangePasswordModel } from "./changePasswordModel";
import { ChangePasswordModelBinder } from "./changePasswordModelBinder";
import { ChangePasswordViewModel } from "./react/ChangePasswordViewModel";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";

export class ChangePasswordPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("changePasswordModelBinder", ChangePasswordModelBinder);
        injector.bindSingleton("changePasswordViewModelBinder", ChangePasswordViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("change-password", {
            modelDefinition: ChangePasswordModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ChangePasswordViewModel,
            modelBinder: ChangePasswordModelBinder,
            viewModelBinder: ChangePasswordViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}