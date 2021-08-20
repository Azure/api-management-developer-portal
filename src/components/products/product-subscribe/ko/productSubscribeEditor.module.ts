import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";
import { ProductSubscribeEditor } from "./productSubscribeEditor";


export class ProductSubscribeEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
		injector.bind("productSubscribeEditor", ProductSubscribeEditor);
        injector.bindToCollection("widgetHandlers", ProductSubscribeHandlers, "productSubscribeHandlers");
    }
}