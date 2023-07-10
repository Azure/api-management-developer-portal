import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignupSocialViewModelBinder } from "./ko/signupSocialViewModelBinder";
import { SignupSocialViewModel } from "./ko/signupSocialViewModel";
import { SignupSocialModel } from "./signupSocialModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { IWidgetService } from "@paperbits/common/widgets";


export class SignupSocialPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signupSocialModelBinder", SignupSocialModelBinder);
        injector.bindSingleton("signupSocialViewModelBinder", SignupSocialViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup-social", {
            modelDefinition: SignupSocialModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignupSocialViewModel,
            modelBinder: SignupSocialModelBinder,
            viewModelBinder: SignupSocialViewModelBinder
        });
    }
}