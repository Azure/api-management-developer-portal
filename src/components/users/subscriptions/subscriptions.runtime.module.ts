import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { registerCustomElement } from "@paperbits/react/customElements";
import { SubscriptionsRuntime } from "./react/SubscriptionsRuntime";

export class SubscriptionsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("SubscriptionsRuntimeModule", SubscriptionsRuntime);
        registerCustomElement(SubscriptionsRuntime, "fui-subscriptions-runtime", injector);
    }
}
