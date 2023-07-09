import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SigninSocialViewModel } from "./ko/signinSocialViewModel";
import { SigninSocialViewModelBinder } from "./ko/signinSocialViewModelBinder";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialModelBinder } from "./signinSocialModelBinder";


export class SigninSocialPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinSocialModelBinder", SigninSocialModelBinder);
        injector.bindSingleton("signinSocialViewModelBinder", SigninSocialViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin-social", {
            modelDefinition: SigninSocialModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SigninSocialViewModel,
            modelBinder: SigninSocialModelBinder,
            viewModelBinder: SigninSocialViewModelBinder
        });
    }
}