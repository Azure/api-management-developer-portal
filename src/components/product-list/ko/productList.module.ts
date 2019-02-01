import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { ProductListModelBinder } from "../productListModelBinder";
import { ProductListViewModelBinder } from "./productListViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class ProductListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("productListModelBinder", ProductListModelBinder);
        const modelBinders = injector.resolve<Array<IModelBinder>>("modelBinders");
        modelBinders.push(injector.resolve("productListModelBinder"));

        injector.bind("productListViewModelBinder", ProductListViewModelBinder);
        const viewModelBinders = injector.resolve<Array<IViewModelBinder<any, any>>>("viewModelBinders");
        viewModelBinders.push(injector.resolve("productListViewModelBinder"));
    }
}