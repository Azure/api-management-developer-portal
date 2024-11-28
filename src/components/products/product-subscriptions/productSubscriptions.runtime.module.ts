import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { ProductSubscriptionsRuntime } from "./react/runtime/ProductSubscriptionsRuntime";

export class ProductSubscriptionsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscriptionsRuntime", ProductSubscriptionsRuntime);
        registerCustomElement(ProductSubscriptionsRuntime, "fui-product-subscriptions-runtime", injector);
    }
}
