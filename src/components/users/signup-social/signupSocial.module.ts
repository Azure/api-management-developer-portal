import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { SignupSocialModelBinder } from "./signupSocialModelBinder";
import { SignupSocialViewModelBinder } from "./ko/signupSocialViewModelBinder";
import { SignupSocialViewModel } from "./ko/signupSocialViewModel";


export class SignupSocialModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("signupSocial", SignupSocialViewModel);
        injector.bindToCollection("modelBinders", SignupSocialModelBinder);
        injector.bindToCollection("viewModelBinders", SignupSocialViewModelBinder);
    }
}