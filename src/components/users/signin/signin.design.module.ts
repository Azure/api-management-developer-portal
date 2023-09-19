import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninHandlers } from "./signinHandlers";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModelBinder } from "./ko/signinViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { SigninModel } from "./signinModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SigninViewModel } from "./ko/signinViewModel";

export class SigninDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinModelBinder", SigninModelBinder);
        injector.bindSingleton("signinViewModelBinder", SigninViewModelBinder)
        injector.bindSingleton("signinHandlers", SigninHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin", {
            modelDefinition: SigninModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SigninViewModel,
            modelBinder: SigninModelBinder,
            viewModelBinder: SigninViewModelBinder
        });

        widgetService.registerWidgetEditor("signin", {
            displayName: "Sign-in form: Basic",
            category: "User",
            iconClass: "widget-icon widget-icon-api-management",
            handlerComponent: SigninHandlers
        });
    }
}