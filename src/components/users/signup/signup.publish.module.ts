import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { SignupViewModelBinder } from "./signupViewModelBinder";
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
            componentBinder: ReactComponentBinder,
            componentDefinition: SignUpViewModel,
            modelBinder: SignupModelBinder,
            viewModelBinder: SignupViewModelBinder
        });
    }
}