import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SubscriptionsModelBinder } from "./subscriptionsModelBinder";
import { SubscriptionsViewModelBinder } from "./ko/subscriptionsViewModelBinder";


export class SubscriptionsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", SubscriptionsModelBinder);
        injector.bindToCollection("viewModelBinders", SubscriptionsViewModelBinder);
    }
}