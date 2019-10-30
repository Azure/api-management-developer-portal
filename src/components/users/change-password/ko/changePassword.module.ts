import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ChangePasswordModelBinder } from "../changePasswordModelBinder";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";
import { ChangePasswordViewModel } from "./changePasswordViewModel";


export class ChangePasswordModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("changePassword", ChangePasswordViewModel);
        injector.bindToCollection("modelBinders", ChangePasswordModelBinder);
        injector.bindToCollection("viewModelBinders", ChangePasswordViewModelBinder);
    }
}