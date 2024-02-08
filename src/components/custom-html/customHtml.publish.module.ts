import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomHtmlViewModel } from "./ko/customHtmlViewModel";
import { CustomHtmlModelBinder } from "./customHtmlModelBinder";
import { CustomHtmlViewModelBinder } from "./ko/customHtmlViewModelBinder";
import { widgetName } from "./constants";
import { IWidgetService } from "@paperbits/common/widgets";
import { CustomHtmlModel } from "./customHtmlModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";


export class CustomHtmlPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("customHtmlModelBinder", CustomHtmlModelBinder);
        injector.bindSingleton("customHtmlViewModelBinder", CustomHtmlViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget(widgetName, {
            modelDefinition: CustomHtmlModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomHtmlViewModel,
            modelBinder: CustomHtmlModelBinder,
            viewModelBinder: CustomHtmlViewModelBinder
        });
    }
}