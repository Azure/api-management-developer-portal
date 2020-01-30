import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ResetPasswordModelBinder } from "./resetPasswordModelBinder";
import { ResetPasswordViewModelBinder } from "./ko/resetPasswordViewModelBinder";
import { ResetPasswordViewModel } from "./ko/resetPasswordViewModel";


export class ResetPasswordModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("resetPassword", ResetPasswordViewModel);
        injector.bindToCollection("modelBinders", ResetPasswordModelBinder);
        injector.bindToCollection("viewModelBinders", ResetPasswordViewModelBinder);
    }
}