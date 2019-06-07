import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductApisHandlers } from "../productApisHandlers";

export class ProductApisEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productApisHandlers", ProductApisHandlers);
        injector.bindToCollection("widgetHandlers", ProductApisHandlers);
    }
}