import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ResetPasswordModelBinder } from "../resetPasswordModelBinder";
import { ResetPasswordViewModelBinder } from "./resetPasswordViewModelBinder";


export class ResetPasswordModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ResetPasswordModelBinder);
        injector.bindToCollection("viewModelBinders", ResetPasswordViewModelBinder);
    }
}