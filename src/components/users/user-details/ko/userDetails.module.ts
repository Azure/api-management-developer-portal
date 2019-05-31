import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserDetailsModelBinder } from "../userDetailsModelBinder";
import { UserDetailsViewModelBinder } from "./userDetailsViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class UserDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userDetailsModelBinder", UserDetailsModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("userDetailsModelBinder"));

        injector.bind("userDetailsViewModelBinder", UserDetailsViewModelBinder);
        const viewModelBinders = injector.resolve<Array<ViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("userDetailsViewModelBinder"));
    }
}