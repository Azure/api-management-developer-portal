import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserSubscriptionsModelBinder } from "../userSubscriptionsModelBinder";
import { UserSubscriptionsViewModelBinder } from "./userSubscriptionsViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class UserSubscriptionsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSubscriptionsModelBinder", UserSubscriptionsModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("userSubscriptionsModelBinder"));

        injector.bind("userSubscriptionsViewModelBinder", UserSubscriptionsViewModelBinder);
        const viewModelBinders = injector.resolve<Array<IViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("userSubscriptionsViewModelBinder"));
    }
}