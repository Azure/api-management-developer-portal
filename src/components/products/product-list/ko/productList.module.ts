import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductListViewModel } from "../../product-list/ko/productListViewModel";
import { ProductListModelBinder } from "../productListModelBinder";
import { ProductListViewModelBinder } from "./productListViewModelBinder";


export class ProductListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productList", ProductListViewModel);
        injector.bindToCollection("modelBinders", ProductListModelBinder);
        injector.bindToCollection("viewModelBinders", ProductListViewModelBinder);
    }
}