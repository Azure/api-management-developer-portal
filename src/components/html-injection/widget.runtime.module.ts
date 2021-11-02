import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { WidgetRuntime } from "./ko/runtime/widget-runtime";

/**
 * Inversion of control module that registers runtime-time dependencies.
 */
export class HtmlInjectionRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("widgetRuntime", WidgetRuntime);
    }
}