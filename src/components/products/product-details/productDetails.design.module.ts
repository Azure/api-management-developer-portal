import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductDetailsHandlers } from "./productDetailsHandlers";

export class ProductDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productDetailsHandlers", ProductDetailsHandlers);
        injector.bindToCollection("widgetHandlers", ProductDetailsHandlers);
    }
}