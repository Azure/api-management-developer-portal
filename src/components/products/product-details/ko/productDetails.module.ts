import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductDetailsModelBinder } from "../productDetailsModelBinder";
import { ProductDetailsViewModelBinder } from "./productDetailsViewModelBinder";


export class ProductDetailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProductDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", ProductDetailsViewModelBinder);
    }
}