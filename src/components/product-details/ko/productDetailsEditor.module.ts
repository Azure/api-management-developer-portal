import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductDetailsHandlers } from "../productDetailsHandlers";

export class ProductDetailsEditorModule implements IInjectorModule {
    register(injector: IInjector): void {
        injector.bindSingleton("productDetailsHandlers", ProductDetailsHandlers);

        const widgetHandlers:Array<IWidgetHandler> = injector.resolve("widgetHandlers");
        widgetHandlers.push(injector.resolve<ProductDetailsHandlers>("productDetailsHandlers"));
    }
}