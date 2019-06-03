import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupModelBinder } from "../userSignupModelBinder";
import { UserSignupViewModelBinder } from "./userSignupViewModelBinder";


export class UserSignupModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserSignupModelBinder);
        injector.bindToCollection("viewModelBinders", UserSignupViewModelBinder);
    }
}