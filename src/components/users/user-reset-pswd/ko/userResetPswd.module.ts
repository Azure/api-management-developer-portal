import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserResetPswdModelBinder } from "../userResetPswdModelBinder";
import { UserResetPswdViewModelBinder } from "./userResetPswdViewModelBinder";


export class UserResetPswdModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserResetPswdModelBinder);
        injector.bindToCollection("viewModelBinders", UserResetPswdViewModelBinder);
    }
}