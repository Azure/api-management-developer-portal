import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductApisRuntime } from "./react/runtime/ProductApisRuntime";
import { registerCustomElement } from "@paperbits/react/customElements";

export class ProductApisRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productApsRuntime", ProductApisRuntime);
        registerCustomElement(ProductApisRuntime, "fui-product-apis-runtime", injector);
    }
}
