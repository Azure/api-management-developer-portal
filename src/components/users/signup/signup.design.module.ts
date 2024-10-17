import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupHandlers } from "./signupHandlers";
import { SignUpEditor } from "./react/SignUpEditor";
import { SignupModel } from "./signupModel";
import { SignupViewModelBinder } from "./signupViewModelBinder";
import { SignupModelBinder } from "./signupModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings/reactComponentBinder";
import { SignUpViewModel } from "./react/SignUpViewModel";
import { ComponentFlow } from "@paperbits/common/components";

export class SignupDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signupEditor", SignUpEditor);
        injector.bindSingleton("signupModelBinder", SignupModelBinder);
        injector.bindSingleton("signupViewModelBinder", SignupViewModelBinder)
        injector.bindSingleton("signupHandlers", SignupHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup", {
            modelDefinition: SignupModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SignUpViewModel,
            modelBinder: SignupModelBinder,
            viewModelBinder: SignupViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("signup", {
            displayName: "Sign-up form: Basic",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: ReactComponentBinder,
            componentDefinition: SignUpEditor,
            handlerComponent: SignupHandlers
        });
    }
}