import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserDetailsModelBinder } from "../userDetailsModelBinder";
import { UserDetailsViewModelBinder } from "./userDetailsViewModelBinder";


export class UserDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", UserDetailsViewModelBinder);
    }
}