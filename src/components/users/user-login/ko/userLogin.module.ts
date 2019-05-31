import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { UserLoginModelBinder } from "../userLoginModelBinder";
import { UserLoginViewModelBinder } from "./userLoginViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class UserLoginModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userLoginModelBinder", UserLoginModelBinder);
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("userLoginModelBinder"));

        injector.bind("userLoginViewModelBinder", UserLoginViewModelBinder);
        const viewModelBinders = injector.resolve<ViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("userLoginViewModelBinder"));
    }
}