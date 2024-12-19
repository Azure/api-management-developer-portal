import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SignupSocialModel } from "./signupSocialModel";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignUpSocialViewModel } from "./react/SignUpSocialViewModel";
import { SignupSocialViewModelBinder } from "./signupSocialViewModelBinder";

export class SignupSocialPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signupSocialModelBinder", SignupSocialModelBinder);
        injector.bindSingleton("signupSocialViewModelBinder", SignupSocialViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup-social", {
            modelDefinition: SignupSocialModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SignUpSocialViewModel,
            modelBinder: SignupSocialModelBinder,
            viewModelBinder: SignupSocialViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}