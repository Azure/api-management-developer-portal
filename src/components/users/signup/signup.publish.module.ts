import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SignupModel } from "./signupModel";
import { SignupModelBinder } from "./signupModelBinder";
import { SignUpViewModel } from "./react/SignUpViewModel";
import { SignupViewModelBinder } from "./signupViewModelBinder";

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
            viewModelBinder: SignupViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}