import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModelBinder } from "./ko/signinViewModelBinder";


export class SigninModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", SigninModelBinder);
        injector.bindToCollection("viewModelBinders", SigninViewModelBinder);
    }
}