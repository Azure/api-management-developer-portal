import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductSubscriptionsRuntime } from "./react/ProductSubscriptionsRuntime";
import { registerCustomElement } from "@paperbits/react/customElements";

export class ProductSubscriptionsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscriptionsRuntime", ProductSubscriptionsRuntime);
        registerCustomElement(ProductSubscriptionsRuntime, "fui-product-subscriptions-runtime", injector);
    }
}
