import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsHandlers } from "./subscriptionsHandlers";

export class SubscriptionsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("widgetHandlers", SubscriptionsHandlers, "subscriptionsHandlers");
    }
}