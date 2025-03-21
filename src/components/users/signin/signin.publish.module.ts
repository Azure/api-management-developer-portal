import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { SigninModel } from "./signinModel";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModel } from "./react/SigninViewModel";
import { SigninViewModelBinder } from "./signinViewModelBinder";

export class SigninPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinModelBinder", SigninModelBinder);
        injector.bindSingleton("signinViewModelBinder", SigninViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin", {
            modelDefinition: SigninModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: SigninViewModel,
            modelBinder: SigninModelBinder,
            viewModelBinder: SigninViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}