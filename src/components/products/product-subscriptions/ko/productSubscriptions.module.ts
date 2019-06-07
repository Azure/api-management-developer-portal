import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscriptionsModelBinder } from "../productSubscriptionsModelBinder";
import { ProductSubscriptionsViewModelBinder } from "./productSubscriptionsViewModelBinder";
import { ProductSubscriptionsViewModel } from "./productSubscriptionsViewModel";


export class ProductSubscriptionsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productSubscriptions", ProductSubscriptionsViewModel);
        injector.bindToCollection("modelBinders", ProductSubscriptionsModelBinder);
        injector.bindToCollection("viewModelBinders", ProductSubscriptionsViewModelBinder);
    }
}