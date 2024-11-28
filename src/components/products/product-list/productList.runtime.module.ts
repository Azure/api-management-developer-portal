import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ProductsListRuntime } from "./react/runtime/ProductsListRuntime";

export class ProductListRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("ProductListRuntime", ProductsListRuntime);
        registerCustomElement(ProductsListRuntime, "fui-product-list-runtime", injector);
    }
}
