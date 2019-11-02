import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSignupSocialModelBinder } from "../userSignupSocialModelBinder";
import { UserSignupSocialViewModelBinder } from "./userSignupSocialViewModelBinder";
import { UserSignupSocialViewModel } from "./userSignupSocialViewModel";


export class UserSignupSocialModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSignupSocial", UserSignupSocialViewModel);
        injector.bindToCollection("modelBinders", UserSignupSocialModelBinder);
        injector.bindToCollection("viewModelBinders", UserSignupSocialViewModelBinder);
    }
}