import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ProductSubscribeModelBinder } from "../productSubscribeModelBinder";
import { ProductSubscribeViewModelBinder } from "./productSubscribeViewModelBinder";


export class ProductSubscribeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ProductSubscribeModelBinder);
        injector.bindToCollection("viewModelBinders", ProductSubscribeViewModelBinder);
    }
}