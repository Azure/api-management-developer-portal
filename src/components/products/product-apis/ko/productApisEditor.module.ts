import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductApisHandlers, ProductApisTilesHandlers } from "../productApisHandlers";
import { ProductApisEditor } from "./productApisEditor";

export class ProductApisEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productApisEditor", ProductApisEditor);
        injector.bindToCollection("widgetHandlers", ProductApisHandlers, "productApisHandlers");
        injector.bindToCollection("widgetHandlers", ProductApisTilesHandlers, "productApisTilesHandlers");
    }
}