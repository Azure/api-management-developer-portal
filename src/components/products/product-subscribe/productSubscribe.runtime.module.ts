import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ProductSubscribeRuntime } from "./react/runtime/ProductSubscribeRuntime";

export class ProductSubscribeRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ProductSubscribeRuntimeRuntime", ProductSubscribeRuntime);
        registerCustomElement(ProductSubscribeRuntime, "fui-product-subscribe-runtime", injector);
    }
}
