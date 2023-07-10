import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupHandlers } from "./signupHandlers";
import { SignupEditor } from "./ko/signupEditor";
import { SignupModel } from "./signupModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SignupViewModel } from "./ko/signupViewModel";
import { SignupViewModelBinder } from "./ko/signupViewModelBinder";
import { SignupModelBinder } from "./signupModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";

export class SignupDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signupEditor", SignupEditor);
        injector.bindSingleton("signupModelBinder", SignupModelBinder);
        injector.bindSingleton("signupViewModelBinder", SignupViewModelBinder)
        injector.bindSingleton("signupHandlers", SignupHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signup", {
            modelDefinition: SignupModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignupViewModel,
            modelBinder: SignupModelBinder,
            viewModelBinder: SignupViewModelBinder
        });

        widgetService.registerWidgetEditor("signup", {
            displayName: "Sign-up form: Basic",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SignupEditor,
            handlerComponent: SignupHandlers
        });
    }
}