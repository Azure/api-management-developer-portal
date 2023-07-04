import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ProductDetailsPageModelBinder } from "../productDetailsPageModelBinder";
import { ProductDetailsPageViewModelBinder } from "./productDetailsPageViewModelBinder";

export class ProductDetailsPageModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProductDetailsPageModelBinder);
        injector.bindToCollection("viewModelBinders", ProductDetailsPageViewModelBinder);
    }
}