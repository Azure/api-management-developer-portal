import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SignInSocialEditor } from "./ko/signinSocialEditor";
import { SigninSocialViewModel } from "./ko/signinSocialViewModel";
import { SigninSocialViewModelBinder } from "./ko/signinSocialViewModelBinder";
import { SigninSocialHandlers } from "./signinSocialHandlers";
import { SigninSocialModel } from "./signinSocialModel";
import { SigninSocialModelBinder } from "./signinSocialModelBinder";


export class SigninSocialEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signinSocialEditor", SignInSocialEditor);
        injector.bindSingleton("signinSocialModelBinder", SigninSocialModelBinder);
        injector.bindSingleton("signinSocialViewModelBinder", SigninSocialViewModelBinder)
        injector.bindSingleton("signinSocialHandlers", SigninSocialHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin-social", {
            modelDefinition: SigninSocialModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SigninSocialViewModel,
            modelBinder: SigninSocialModelBinder,
            viewModelBinder: SigninSocialViewModelBinder
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