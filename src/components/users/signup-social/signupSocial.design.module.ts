import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialHandlers } from "./signupSocialHandlers";
import { SignupSocialModel } from "./signupSocialModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SignupSocialViewModel } from "./ko/signupSocialViewModel";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignupSocialViewModelBinder } from "./ko/signupSocialViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";

export class SignupSocialDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signupSocialModelBinder", SignupSocialModelBinder);
        injector.bindSingleton("signupSocialViewModelBinder", SignupSocialViewModelBinder)
        injector.bindSingleton("signupSocialHandlers", SignupSocialHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup-social", {
            modelDefinition: SignupSocialModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignupSocialViewModel,
            modelBinder: SignupSocialModelBinder,
            viewModelBinder: SignupSocialViewModelBinder
        });

        widgetService.registerWidgetEditor("signup-social", {
            displayName: "Sign-up form: OAuth",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SignupSocialHandlers
        });
    }
}