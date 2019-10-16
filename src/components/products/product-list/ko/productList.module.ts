import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductListModelBinder } from "../productListModelBinder";
import { ProductListViewModelBinder } from "./productListViewModelBinder";


export class ProductListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProductListModelBinder);
        injector.bindToCollection("viewModelBinders", ProductListViewModelBinder);
    }
}