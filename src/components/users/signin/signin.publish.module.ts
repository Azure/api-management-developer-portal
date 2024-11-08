import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModelBinder } from "./signinViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { SigninModel } from "./signinModel";
import { SigninViewModel } from "./react/SigninViewModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";


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