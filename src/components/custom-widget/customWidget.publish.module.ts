import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko/knockoutComponentBinder";
import { CustomWidgetModel } from "./customWidgetModel";
import { CustomWidgetModelBinder } from "./customWidgetModelBinder.publish";
import { CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";

export class CustomWidgetPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("customWidgetModelBinder", CustomWidgetModelBinder);
        injector.bindSingleton("customWidgetViewModelBinder", CustomWidgetViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("custom-widget", {
            modelDefinition: CustomWidgetModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetViewModel,
            modelBinder: CustomWidgetModelBinder,
            viewModelBinder: CustomWidgetViewModelBinder
        });
    }
}
