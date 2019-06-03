import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserLoginModelBinder } from "../userLoginModelBinder";
import { UserLoginViewModelBinder } from "./userLoginViewModelBinder";


export class UserLoginModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserLoginModelBinder);
        injector.bindToCollection("viewModelBinders", UserLoginViewModelBinder);
    }
}