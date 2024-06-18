import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductSubscribeRuntime } from "./react/ProductSubscribeRuntime";
import { registerCustomElement } from "@paperbits/react/customElements";

export class ProductSubscribeRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ProductSubscribeRuntimeRuntime", ProductSubscribeRuntime);
        registerCustomElement(ProductSubscribeRuntime, "fui-product-subscribe-runtime", injector);
    }
}
