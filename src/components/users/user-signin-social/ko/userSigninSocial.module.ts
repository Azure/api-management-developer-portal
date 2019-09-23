import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSigninSocialModelBinder } from "../userSigninSocialModelBinder";
import { UserSigninSocialViewModelBinder } from "./userSigninSocialViewModelBinder";
import { UserSigninSocialViewModel } from "./userSigninSocialViewModel";


export class UserSigninSocialModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("userSigninSocialViewModel", UserSigninSocialViewModel);
        injector.bindToCollection("modelBinders", UserSigninSocialModelBinder);
        injector.bindToCollection("viewModelBinders", UserSigninSocialViewModelBinder);
    }
}