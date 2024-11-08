import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignupSocialViewModelBinder } from "./signupSocialViewModelBinder";
import { SignupSocialModel } from "./signupSocialModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SignUpSocialViewModel } from "./react/SignUpSocialViewModel";
import { ComponentFlow } from "@paperbits/common/components";

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