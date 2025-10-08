import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialModelBinder } from "./signinSocialModelBinder";
import { SignInSocialViewModel } from "./react/SignInSocialViewModel";
import { SigninSocialViewModelBinder } from "./signinSocialViewModelBinder";

export class SigninSocialPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinSocialModelBinder", SigninSocialModelBinder);
        injector.bindSingleton("signinSocialViewModelBinder", SigninSocialViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin-social", {
            modelDefinition: SigninSocialModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SignInSocialViewModel,
            modelBinder: SigninSocialModelBinder,
            viewModelBinder: SigninSocialViewModelBinder
        });
    }
}