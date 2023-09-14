import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductDetailsPageEditor } from "./productDetailsPageEditor";
import { ProductDetailsPageHandlers } from "../productDetailsPageHandlers";

export class ProductDetailsPageEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("productDetailsPageEditor", ProductDetailsPageEditor);
        injector.bindToCollection("widgetHandlers", ProductDetailsPageHandlers, "productDetailsPageHandlers");
    }
}