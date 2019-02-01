import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";

export class ProductSubscribeEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("productSubscribeHandlers", ProductSubscribeHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<ProductSubscribeHandlers>("productSubscribeHandlers"));
    }
}