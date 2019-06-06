import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductDetailsModelBinder } from "../productDetailsModelBinder";
import { ProductDetailsViewModelBinder } from "./productDetailsViewModelBinder";
import { ProductDetailsViewModel } from "./productDetailsViewModel";


export class ProductDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productDetails", ProductDetailsViewModel);
        injector.bindToCollection("modelBinders", ProductDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", ProductDetailsViewModelBinder);
    }
}