import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductListHandlers } from "../productListHandlers";
import { ProductListEditor } from "./productListEditor";

export class ProductListEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productListEditor", ProductListEditor);
        injector.bindToCollection("widgetHandlers", ProductListHandlers, "productListHandlers");
    }
}