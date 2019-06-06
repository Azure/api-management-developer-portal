import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductApisModelBinder } from "../productApisModelBinder";
import { ProductApisViewModelBinder } from "./productApisViewModelBinder";
import { ProductApisViewModel } from "./productApisViewModel";


export class ProductApisModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productApis", ProductApisViewModel);
        injector.bindToCollection("modelBinders", ProductApisModelBinder);
        injector.bindToCollection("viewModelBinders", ProductApisViewModelBinder);
    }
}