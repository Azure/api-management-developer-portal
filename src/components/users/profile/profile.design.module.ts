import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ProfileModel } from "./profileModel";
import { ProfileModelBinder } from "./profileModelBinder";
import { ProfileViewModel } from "./react/ProfileViewModel";
import { ProfileViewModelBinder } from "./profileViewModelBinder";
import { ProfileHandlers } from "./profileHandlers";

export class ProfileDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("profileModelBinder", ProfileModelBinder);
        injector.bindSingleton("profileViewModelBinder", ProfileViewModelBinder)
        injector.bindSingleton("profileHandlers", ProfileHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("profile", {
            modelDefinition: ProfileModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ProfileViewModel,
            modelBinder: ProfileModelBinder,
            viewModelBinder: ProfileViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("profile", {
            displayName: "User: Profile",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: ProfileHandlers
        });
    }
}