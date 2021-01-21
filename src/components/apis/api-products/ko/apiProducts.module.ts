import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiProductsModelBinder } from "../apiProductsModelBinder";
import { ApiProductsViewModelBinder } from "./apiProductsViewModelBinder";
import { ApiProductsViewModel } from "./apiProductsViewModel";

export class ApiProductsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiProducts", ApiProductsViewModel);
        injector.bindToCollection("modelBinders", ApiProductsModelBinder);
        injector.bindToCollection("viewModelBinders", ApiProductsViewModelBinder);
    }
}