import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupModelBinder } from "./signupModelBinder";
import { SignupViewModelBinder } from "./ko/signupViewModelBinder";
import { SignupViewModel } from "./ko/signupViewModel";


export class SignupModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signup", SignupViewModel);
        injector.bindToCollection("modelBinders", SignupModelBinder);
        injector.bindToCollection("viewModelBinders", SignupViewModelBinder);
    }
}