import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscribeHandlers } from "../productSubscribeHandlers";

export class ProductSubscribeEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", ProductSubscribeHandlers, "productSubscribeHandlers");
    }
}