import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductListHandlers } from "../productListHandlers";

export class ProductListEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("productListHandlers", ProductListHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<ProductListHandlers>("productListHandlers"));
    }
}