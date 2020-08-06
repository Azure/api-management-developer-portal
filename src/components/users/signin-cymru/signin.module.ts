import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninModelBinder } from "./signinModelBinder";
import { SigninViewModelBinder } from "./ko/signinViewModelBinder";
import { SigninViewModel } from "./ko/signinViewModel";

export class SigninModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signinCymru", SigninViewModel);
        injector.bindToCollection("modelBinders", SigninModelBinder);
        injector.bindToCollection("viewModelBinders", SigninViewModelBinder);
    }
}