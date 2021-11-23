import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { WidgetEditorViewModel } from "./ko/widgetEditorViewModel";
import { HTMLInjectionWidgetHandlers } from "./widgetHandlers";
import { WidgetViewModel, WidgetViewModelBinder } from "./ko";
import { HTMLInjectionWidgetModelBinder } from ".";

/**
 * Inversion of control module that registers design-time dependencies.
 */
export class HtmlInjectionDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", WidgetViewModel);
        injector.bind("widgetEditor", WidgetEditorViewModel);
        injector.bindToCollection("modelBinders", HTMLInjectionWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", WidgetViewModelBinder);
        injector.bindToCollection("widgetHandlers", HTMLInjectionWidgetHandlers);
    }
}