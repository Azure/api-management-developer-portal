import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SigninSocialModelBinder } from "./signinSocialModelBinder";
import { SigninSocialViewModelBinder } from "./ko/signinSocialViewModelBinder";
import { SigninSocialViewModel } from "./ko/signinSocialViewModel";


export class SigninSocialModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signinSocialViewModel", SigninSocialViewModel);
        injector.bindToCollection("modelBinders", SigninSocialModelBinder);
        injector.bindToCollection("viewModelBinders", SigninSocialViewModelBinder);
    }
}