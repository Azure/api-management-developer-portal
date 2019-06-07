import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscriptionsHandlers } from "../productSubscriptionsHandlers";

export class ProductSubscriptionsEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("productSubscriptionHandlers", ProductSubscriptionsHandlers);
        injector.bindToCollection("widgetHandlers", ProductSubscriptionsHandlers);
    }
}