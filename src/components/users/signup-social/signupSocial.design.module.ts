import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialHandlers } from "./signupSocialHandlers";
import { SignupSocialModel } from "./signupSocialModel";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignupSocialViewModelBinder } from "./signupSocialViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SignUpSocialViewModel } from "./react/SignUpSocialViewModel";
import { ComponentFlow } from "@paperbits/common/components";

export class SignupSocialDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signupSocialModelBinder", SignupSocialModelBinder);
        injector.bindSingleton("signupSocialViewModelBinder", SignupSocialViewModelBinder)
        injector.bindSingleton("signupSocialHandlers", SignupSocialHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup-social", {
            modelDefinition: SignupSocialModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SignUpSocialViewModel,
            modelBinder: SignupSocialModelBinder,
            viewModelBinder: SignupSocialViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("signup-social", {
            displayName: "Sign-up form: OAuth",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SignupSocialHandlers
        });
    }
}