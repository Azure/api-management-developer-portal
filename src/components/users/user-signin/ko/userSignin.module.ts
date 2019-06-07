import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserSigninModelBinder } from "../userSigninModelBinder";
import { UserSigninViewModelBinder } from "./userSigninViewModelBinder";


export class UserSigninModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserSigninModelBinder);
        injector.bindToCollection("viewModelBinders", UserSigninViewModelBinder);
    }
}