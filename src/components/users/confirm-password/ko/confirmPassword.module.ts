import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ConfirmPasswordModelBinder } from "../confirmPasswordModelBinder";
import { ConfirmPassworViewModelBinder } from "./confirmPasswordViewModelBinder";

export class ConfirmPasswordModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ConfirmPasswordModelBinder);
        injector.bindToCollection("viewModelBinders", ConfirmPassworViewModelBinder);
    }
}