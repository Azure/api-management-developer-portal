import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModelBinder } from "./ko/signinViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { SigninModel } from "./signinModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { SigninViewModel } from "./ko/signinViewModel";


export class SigninPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("signinModelBinder", SigninModelBinder);
        injector.bindSingleton("signinViewModelBinder", SigninViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("signin", {
            modelDefinition: SigninModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: SigninViewModel,
            modelBinder: SigninModelBinder,
            viewModelBinder: SigninViewModelBinder
        });
    }
}