import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { UserSignupModelBinder } from "../userSignupModelBinder";
import { UserSignupViewModelBinder } from "./userSignupViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class UserSignupModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSignupModelBinder", UserSignupModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("userSignupModelBinder"));

        injector.bind("userSignupViewModelBinder", UserSignupViewModelBinder);
        const viewModelBinders = injector.resolve<Array<IViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("userSignupViewModelBinder"));
    }
}