import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupModelBinder } from "../userSignupModelBinder";
import { UserSignupViewModelBinder } from "./userSignupViewModelBinder";
import { UserSignupViewModel } from "./userSignupViewModel";


export class UserSignupModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSignup", UserSignupViewModel);
        injector.bindToCollection("modelBinders", UserSignupModelBinder);
        injector.bindToCollection("viewModelBinders", UserSignupViewModelBinder);
    }
}