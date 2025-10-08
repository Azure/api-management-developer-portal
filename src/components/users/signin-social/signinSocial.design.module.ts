import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SigninSocialHandlers } from "./signinSocialHandlers";
import { SignInSocialEditor } from "./ko/signinSocialEditor";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialModelBinder } from "./signinSocialModelBinder";
import { SignInSocialViewModel } from "./react/SignInSocialViewModel";
import { SigninSocialViewModelBinder } from "./signinSocialViewModelBinder";

export class SigninSocialDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signinSocialEditor", SignInSocialEditor);
        injector.bindSingleton("signinSocialModelBinder", SigninSocialModelBinder);
        injector.bindSingleton("signinSocialViewModelBinder", SigninSocialViewModelBinder)
        injector.bindSingleton("signinSocialHandlers", SigninSocialHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin-social", {
            modelDefinition: SigninSocialModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SignInSocialViewModel,
            modelBinder: SigninSocialModelBinder,
            viewModelBinder: SigninSocialViewModelBinder,
        });

        widgetService.registerWidgetEditor("signin-social", {
            displayName: "Sign-in button: OAuth",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignInSocialEditor,
            handlerComponent: SigninSocialHandlers
        });

    }
}