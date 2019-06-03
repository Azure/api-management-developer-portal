import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSubscriptionsModelBinder } from "../userSubscriptionsModelBinder";
import { UserSubscriptionsViewModelBinder } from "./userSubscriptionsViewModelBinder";


export class UserSubscriptionsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserSubscriptionsModelBinder);
        injector.bindToCollection("viewModelBinders", UserSubscriptionsViewModelBinder);
    }
}