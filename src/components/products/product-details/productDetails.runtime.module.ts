import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ProductDetailsRuntime } from "./react/runtime/ProductDetailsRuntime";

export class ProductDetailsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ProductDetailsRuntimeModule", ProductDetailsRuntime);
        registerCustomElement(ProductDetailsRuntime, "fui-product-details-runtime", injector);
    }
}
