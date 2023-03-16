import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiDetailsPageModelBinder } from "../apiDetailsPageModelBinder";
import { ApiDetailsPageViewModelBinder } from "./apiDetailsPageViewModelBinder";

export class ApiDetailsPageModule implements IInjectorModule{
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApiDetailsPageModelBinder);
        injector.bindToCollection("viewModelBinders", ApiDetailsPageViewModelBinder);
    }
}