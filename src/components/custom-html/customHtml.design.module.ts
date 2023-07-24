import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomHtmlEditorViewModel } from "./ko/customHtmlEditorViewModel";
import { HTMLInjectionHandlers } from "./customHtmlHandlers";
import { CustomHtmlViewModel, CustomHtmlViewModelBinder } from "./ko";
import { CustomHtmlModelBinder, CustomHtmlModel, widgetCategory, widgetDisplayName, widgetName } from ".";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";

export class CustomHtmlDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customHtmlEditor", CustomHtmlEditorViewModel);
        injector.bindSingleton("customHtmlModelBinder", CustomHtmlModelBinder);
        injector.bindSingleton("customHtmlViewModelBinder", CustomHtmlViewModelBinder)
        injector.bindSingleton("customHtmlHandlers", HTMLInjectionHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget(widgetName, {
            modelDefinition: CustomHtmlModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomHtmlViewModel,
            modelBinder: CustomHtmlModelBinder,
            viewModelBinder: CustomHtmlViewModelBinder
        });

        widgetService.registerWidgetEditor(widgetName, {
            displayName: widgetDisplayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomHtmlEditorViewModel,
            handlerComponent: HTMLInjectionHandlers
        });
    }
}