import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HtmlInjectionEditorViewModel } from "./ko/htmlInjectionEditorViewModel";
import { HTMLInjectionHandlers } from "./htmlInjectionHandlers";
import { HtmlInjectionViewModel, HtmlInjectionViewModelBinder } from "./ko";
import { HTMLInjectionModelBinder } from ".";

/**
 * Inversion of control module that registers design-time dependencies.
 */
export class HtmlInjectionDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widget", HtmlInjectionViewModel);
        injector.bind("widgetEditor", HtmlInjectionEditorViewModel);
        injector.bindToCollection("modelBinders", HTMLInjectionModelBinder);
        injector.bindToCollection("viewModelBinders", HtmlInjectionViewModelBinder);
        injector.bindToCollection("widgetHandlers", HTMLInjectionHandlers);
    }
}