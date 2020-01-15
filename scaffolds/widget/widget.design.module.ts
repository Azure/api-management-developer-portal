import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { WidgetEditorViewModel } from "./ko/widgetEditorViewModel";
import { WidgetHandlers } from "./widgetHandlers";
import { WidgetViewModel, WidgetViewModelBinder } from "./ko";
import { WidgetModelBinder } from ".";

/**
 * Inversion of control module that registers design-time dependencies.
 */
export class WidgetDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", WidgetViewModel);
        injector.bind("widgetEditor", WidgetEditorViewModel);
        injector.bindToCollection("modelBinders", WidgetModelBinder);
        injector.bindToCollection("viewModelBinders", WidgetViewModelBinder);
        injector.bindToCollection("widgetHandlers", WidgetHandlers);
    }
}