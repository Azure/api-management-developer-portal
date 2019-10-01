import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ChangePasswordModelBinder } from "../changePasswordModelBinder";
import { ChangePasswordViewModelBinder } from "./changePasswordViewModelBinder";


export class ChangePasswordModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ChangePasswordModelBinder);
        injector.bindToCollection("viewModelBinders", ChangePasswordViewModelBinder);
    }
}