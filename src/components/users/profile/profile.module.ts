import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ProfileViewModel } from "./ko/profileViewModel";
import { ProfileViewModelBinder } from "./ko/profileViewModelBinder";
import { ProfileHandlers } from "./profileHandlers";
import { ProfileModel } from "./profileModel";
import { ProfileModelBinder } from "./profileModelBinder";


export class ProfilePublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("profileModelBinder", ProfileModelBinder);
        injector.bindSingleton("profileViewModelBinder", ProfileViewModelBinder)
        injector.bindSingleton("profileHandlers", ProfileHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("profile", {
            modelDefinition: ProfileModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ProfileViewModel,
            modelBinder: ProfileModelBinder,
            viewModelBinder: ProfileViewModelBinder
        });
    }
}