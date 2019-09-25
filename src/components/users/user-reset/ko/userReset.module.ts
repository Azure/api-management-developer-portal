import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { UserResetModelBinder } from "../userResetModelBinder";
import { UserResetViewModelBinder } from "./userResetViewModelBinder";


export class UserResetModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", UserResetModelBinder);
        injector.bindToCollection("viewModelBinders", UserResetViewModelBinder);
    }
}