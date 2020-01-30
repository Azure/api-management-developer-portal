import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProfileModelBinder } from "./profileModelBinder";
import { ProfileViewModelBinder } from "./ko/profileViewModelBinder";


export class ProfileModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProfileModelBinder);
        injector.bindToCollection("viewModelBinders", ProfileViewModelBinder);
    }
}