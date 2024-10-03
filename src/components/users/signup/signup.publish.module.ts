import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SignupViewModelBinder } from "./ko/signupViewModelBinder";
import { SignupModel } from "./signupModel";
import { SignupModelBinder } from "./signupModelBinder";
import { SignUpViewModel } from "./react/SignUpViewModel";

export class SignupPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signupModelBinder", SignupModelBinder);
        injector.bindSingleton("signupViewModelBinder", SignupViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup", {
            modelDefinition: SignupModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignUpViewModel,
            modelBinder: SignupModelBinder,
            viewModelBinder: SignupViewModelBinder
        });
    }
}