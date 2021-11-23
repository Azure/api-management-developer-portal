import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { WidgetViewModel } from "./ko/widgetViewModel";
import { HTMLInjectionWidgetModelBinder } from "./widgetModelBinder";
import { WidgetViewModelBinder } from "./ko/widgetViewModelBinder";


/**
 * Inversion of control module that registers publish-time dependencies.
 */
export class HtmlInjectionPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("widget", WidgetViewModel);
        injector.bindToCollection("modelBinders", HTMLInjectionWidgetModelBinder);
        injector.bindToCollection("viewModelBinders", WidgetViewModelBinder);
    }
}