import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SigninHandlers } from "./signinHandlers";
import { SigninModel } from "./signinModel";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModel } from "./react/SigninViewModel";
import { SigninViewModelBinder } from "./signinViewModelBinder";

export class SigninDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinModelBinder", SigninModelBinder);
        injector.bindSingleton("signinViewModelBinder", SigninViewModelBinder)
        injector.bindSingleton("signinHandlers", SigninHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin", {
            modelDefinition: SigninModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SigninViewModel,
            modelBinder: SigninModelBinder,
            viewModelBinder: SigninViewModelBinder,
            componentFlow: ComponentFlow.Block
        });

        widgetService.registerWidgetEditor("signin", {
            displayName: "Sign-in form: Basic",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SigninHandlers
        });
    }
}